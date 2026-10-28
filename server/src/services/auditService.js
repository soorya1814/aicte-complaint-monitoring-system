import { AuditLog } from '../models/AuditLog.js';

export const logAudit = async ({
  req,
  user,
  action,
  resourceType,
  resourceId,
  details = {},
}) => {
  try {
    const actor = user || (req && req.user) || null;
    const ipAddress = req ? req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress : 'internal';
    const userAgent = req ? req.headers['user-agent'] : 'internal';

    await AuditLog.create({
      user: actor ? actor._id : null,
      userEmail: actor ? actor.email : 'System',
      userRole: actor ? actor.role : 'System',
      action,
      resourceType,
      resourceId: resourceId ? String(resourceId) : undefined,
      details,
      ipAddress,
      userAgent,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err.message);
  }
};
