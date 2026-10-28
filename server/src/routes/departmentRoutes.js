import express from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
} from '../controllers/departmentController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(protect);
router.get('/', getDepartments);
router.post('/', authorize('admin'), createDepartment);
router.patch('/:id', authorize('admin'), updateDepartment);

export default router;
