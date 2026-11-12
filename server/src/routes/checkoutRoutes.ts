import { Router } from 'express';
import { evaluateCheckout, approveCheckout } from '../controllers/checkoutController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/evaluate', evaluateCheckout);
router.post('/approve', approveCheckout);

export default router;
