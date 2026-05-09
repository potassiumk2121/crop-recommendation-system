import { Prediction } from '../models/Prediction.js';

/**
 * Aggregates for dashboard charts: trends, top crops, recent activity buckets.
 */
export async function analyticsSummary(req, res) {
  const userId = req.user.id;
  const lastDays = Math.min(parseInt(String(req.query.days || '14'), 10) || 14, 90);

  const since = new Date();
  since.setDate(since.getDate() - lastDays);

  const mine = await Prediction.find({ user: userId }).select('predictedCrop createdAt').lean();

  const countsByDayAllTime = {};
  const countsByDayWindow = {};
  const cropCountInWindow = {};

  for (const p of mine) {
    const dayKey = new Date(p.createdAt).toISOString().slice(0, 10);
    countsByDayAllTime[dayKey] = (countsByDayAllTime[dayKey] || 0) + 1;

    if (new Date(p.createdAt) < since) continue;
    countsByDayWindow[dayKey] = (countsByDayWindow[dayKey] || 0) + 1;

    const c = p.predictedCrop;
    cropCountInWindow[c] = (cropCountInWindow[c] || 0) + 1;
  }

  const trend = Object.entries(countsByDayWindow)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, count]) => ({ date, count }));

  const topCrops = Object.entries(cropCountInWindow)
    .map(([crop, count]) => ({ crop, count }))
    .sort((a, b) => b.count - a.count);

  const last7 = [];
  const now = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    last7.push({ date: key, count: countsByDayAllTime[key] || 0 });
  }

  const totalPredictions = await Prediction.countDocuments({ user: userId });
  const recentCount = mine.filter((p) => new Date(p.createdAt) >= since).length;

  return res.json({
    success: true,
    summary: {
      totalPredictions,
      recentPredictionsInWindow: recentCount,
      windowDays: lastDays,
    },
    charts: {
      predictionTrend: trend,
      predictionsLast7Days: last7,
      mostRecommendedCrops: topCrops.slice(0, 10),
    },
  });
}
