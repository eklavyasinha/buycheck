import { Router } from 'express';
import authRoutes from './authRoutes.js';
import analysisRoutes from './analysisRoutes.js';
import rulesRoutes from './rulesRoutes.js';
import checkoutRoutes from './checkoutRoutes.js';
import paypalRoutes from './paypalRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/analysis', analysisRoutes);
router.use('/rules', rulesRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/paypal', paypalRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'BuyCheck API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
