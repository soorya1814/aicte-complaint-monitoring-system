import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  assignComplaint,
  addMessage,
  reopenComplaint,
} from '../controllers/complaintController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createComplaintSchema,
  updateStatusSchema,
  assignComplaintSchema,
  addMessageSchema,
  reopenComplaintSchema,
} from '../validators/complaintValidators.js';

const router = express.Router();

// All complaint routes require authentication
router.use(protect);

router.post('/', validate(createComplaintSchema), createComplaint);
router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.patch('/:id/status', authorize('officer', 'admin'), validate(updateStatusSchema), updateStatus);
router.patch('/:id/assignment', authorize('officer', 'admin'), validate(assignComplaintSchema), assignComplaint);
router.post('/:id/messages', validate(addMessageSchema), addMessage);
router.post('/:id/reopen', validate(reopenComplaintSchema), reopenComplaint);

export default router;
