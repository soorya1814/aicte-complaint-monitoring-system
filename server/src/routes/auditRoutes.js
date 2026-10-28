import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Audit logs are strictly admin-only
router.get('/', getAuditLogs);

export default router;
