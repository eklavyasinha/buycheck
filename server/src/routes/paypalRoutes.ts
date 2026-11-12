import { Router } from 'express';
import { createOrder, captureOrder, handleWebhook } from '../controllers/paypalController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Webhook does not require user bearer token
router.post('/webhook', handleWebhook);

// Protected endpoints
router.post('/create-order', requireAuth, createOrder);
router.post('/capture-order', requireAuth, captureOrder);

export default router;
