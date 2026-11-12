import { Router } from 'express';
import {
  getRules,
  createRule,
  updateRule,
  deleteRule,
  interpretNaturalLanguageRule,
} from '../controllers/rulesController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getRules);
router.post('/', createRule);
router.post('/interpret', interpretNaturalLanguageRule);
router.put('/:id', updateRule);
router.delete('/:id', deleteRule);

export default router;
