import { Router } from 'express';
import { register, login, getMe, getGuestDemoSession } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/guest-session', getGuestDemoSession);
router.get('/me', requireAuth, getMe);

export default router;
