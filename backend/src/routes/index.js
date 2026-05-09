import { Router } from 'express';
import authRoutes from './authRoutes.js';
import predictionRoutes from './predictionRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/predictions', predictionRoutes);
router.use('/analytics', analyticsRoutes);

router.get('/health', (_req, res) => {
  res.json({ success: true, service: 'crop-recommendation-api', time: new Date().toISOString() });
});

export default router;
