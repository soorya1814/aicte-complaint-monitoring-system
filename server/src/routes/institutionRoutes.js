import express from 'express';
import {
  getInstitutions,
  createInstitution,
  updateInstitution,
} from '../controllers/institutionController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Allow public/open listing for autocomplete during registration
router.get('/public', async (req, res, next) => {
  try {
    const { Institution } = await import('../models/Institution.js');
    const institutions = await Institution.find({ isApproved: true })
      .select('name aicteId state district type')
      .sort({ name: 1 })
      .limit(100);
    res.status(200).json({ success: true, institutions });
  } catch (error) {
    next(error);
  }
});

router.use(protect);
router.get('/', getInstitutions);
router.post('/', authorize('admin'), createInstitution);
router.patch('/:id', authorize('admin'), updateInstitution);

export default router;
