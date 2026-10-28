import express from 'express';
import { getUsers, getOfficers, updateUser } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(protect);

// Allow officers and admins to view active officers (for assignments)
router.get('/officers', authorize('officer', 'admin'), getOfficers);

// Admin-only user management
router.get('/', authorize('admin'), getUsers);
router.patch('/:id', authorize('admin'), updateUser);

export default router;
