import { Router } from 'express';
import { body } from 'express-validator';
import { createPrediction, listPredictions } from '../controllers/predictionController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

const num = (field, min, max) =>
  body(field)
    .isFloat({ min, max })
    .withMessage(`${field} must be between ${min} and ${max}`);

router.post(
  '/',
  [
    num('N', 0, 150),
    num('P', 0, 150),
    num('K', 0, 150),
    num('temperature', -5, 55),
    num('humidity', 0, 100),
    num('ph', 0, 14),
    num('rainfall', 0, 600),
  ],
  createPrediction
);

router.get('/', listPredictions);

export default router;
