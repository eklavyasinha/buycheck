import { Router } from 'express';
import {
  getDashboardSummary,
  getTransactions,
  getSettings,
  updateSettings,
} from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/summary', getDashboardSummary);
router.get('/transactions', getTransactions);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
