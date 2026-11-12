import { Router } from 'express';
import {
  analyzeUrl,
  analyzeImage,
  analyzeText,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
  askAssistant,
  getProtectionEligibility,
} from '../controllers/analysisController.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';

const router = Router();

router.use(requireAuth);

router.post('/url', analyzeUrl);
router.post('/image', uploadImage.single('image'), analyzeImage);
router.post('/text', analyzeText);
router.get('/', getAnalyses);
router.get('/:id', getAnalysisById);
router.delete('/:id', deleteAnalysis);
router.post('/assistant', askAssistant);
router.get('/:id/protection', getProtectionEligibility);

export default router;
