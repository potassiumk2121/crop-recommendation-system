import axios from 'axios';
import { validationResult } from 'express-validator';
import { Prediction } from '../models/Prediction.js';

const FEATURE_KEYS = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'];

function buildMlPayload(body) {
  const o = {};
  for (const k of FEATURE_KEYS) {
    o[k] = body[k];
  }
  return o;
}

/** POST /api/predictions — proxy to Flask ML, persist history */
export async function createPrediction(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const payload = buildMlPayload(req.body);
  const mlBase = (process.env.ML_SERVICE_URL || 'http://localhost:5000').replace(/\/$/, '');

  try {
    const { data } = await axios.post(`${mlBase}/predict`, payload, { timeout: 30_000 });
    if (!data?.crop) {
      return res.status(502).json({
        success: false,
        message: data?.message || 'Unexpected ML service response',
      });
    }
    const crop = data.crop;

    const doc = await Prediction.create({
      user: req.user.id,
      inputs: payload,
      predictedCrop: String(crop),
      confidence: typeof data.confidence === 'number' ? data.confidence : null,
    });

    return res.status(201).json({
      success: true,
      prediction: {
        id: doc._id,
        inputs: doc.inputs,
        predictedCrop: doc.predictedCrop,
        confidence: doc.confidence,
        createdAt: doc.createdAt,
      },
    });
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'ML service unavailable';
    const status = err.response?.status && err.response.status < 500 ? err.response.status : 502;
    return res.status(status).json({ success: false, message: msg });
  }
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** GET /api/predictions — filter by crop name, optional text search on crop label, date range */
export async function listPredictions(req, res) {
  const { search, crop, from, to, limit = '50', skip = '0' } = req.query;
  const q = { user: req.user.id };

  const cropQ = (crop && String(crop).trim()) || (search && String(search).trim());
  if (cropQ) {
    q.predictedCrop = new RegExp(escapeRegex(String(cropQ)), 'i');
  }
  if (from || to) {
    q.createdAt = {};
    if (from) q.createdAt.$gte = new Date(from);
    if (to) q.createdAt.$lte = new Date(to);
  }

  const lim = Math.min(parseInt(String(limit), 10) || 50, 200);
  const sk = parseInt(String(skip), 10) || 0;

  const [items, total] = await Promise.all([
    Prediction.find(q).sort({ createdAt: -1 }).skip(sk).limit(lim).lean(),
    Prediction.countDocuments(q),
  ]);

  return res.json({ success: true, total, predictions: items });
}
