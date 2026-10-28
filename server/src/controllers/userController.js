import { User } from '../models/User.js';
import { logAudit } from '../services/auditService.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, departmentId, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'All') query.role = role;
    if (departmentId && departmentId !== 'All') query.department = departmentId;
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { designation: regex }];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .populate('department', 'name code')
        .populate('institution', 'name aicteId')
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
    ]);

    res.status(200).json({
      success: true,
      users,
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

export const getOfficers = async (req, res, next) => {
  try {
    const { departmentId } = req.query;
    const query = { role: 'officer', isActive: true };
    if (departmentId) query.department = departmentId;

    const officers = await User.find(query)
      .populate('department', 'name code')
      .select('name email designation department')
      .sort({ name: 1 });

    res.status(200).json({ success: true, officers });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, department, isActive, designation, phone } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role) user.role = role;
    if (department !== undefined) user.department = department || null;
    if (isActive !== undefined) user.isActive = isActive;
    if (designation !== undefined) user.designation = designation;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    await logAudit({
      req,
      user: req.user,
      action: 'USER_UPDATED',
      resourceType: 'User',
      resourceId: user._id,
      details: { role, department, isActive },
    });

    const updated = await User.findById(id)
      .populate('department', 'name code')
      .populate('institution', 'name aicteId')
      .select('-password');

    res.status(200).json({ success: true, user: updated, message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
};
