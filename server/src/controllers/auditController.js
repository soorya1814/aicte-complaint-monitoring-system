import { AuditLog } from '../models/AuditLog.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    const { action, resourceType, userEmail, page = 1, limit = 25 } = req.query;
    const query = {};

    if (action && action !== 'All') query.action = action;
    if (resourceType && resourceType !== 'All') query.resourceType = resourceType;
    if (userEmail && userEmail.trim()) {
      query.userEmail = new RegExp(userEmail.trim(), 'i');
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const [total, logs] = await Promise.all([
      AuditLog.countDocuments(query),
      AuditLog.find(query)
        .populate('user', 'name email role')
        .sort({ timestamp: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
    ]);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};
