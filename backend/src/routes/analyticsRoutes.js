import { Router } from 'express';
import { analyticsSummary } from '../controllers/analyticsController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/summary', analyticsSummary);

export default router;
