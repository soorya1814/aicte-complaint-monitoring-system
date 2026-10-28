import express from 'express';
import { analyzeComplaintText, getSimilarComplaints } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/analyze', analyzeComplaintText);
router.get('/similar', getSimilarComplaints);

export default router;
