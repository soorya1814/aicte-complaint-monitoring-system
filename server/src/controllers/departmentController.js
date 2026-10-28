import { Department } from '../models/Department.js';
import { Complaint } from '../models/Complaint.js';
import { logAudit } from '../services/auditService.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate('headOfficer', 'name email designation')
      .sort({ name: 1 });

    // Also attach complaint workload count
    const stats = await Promise.all(
      departments.map(async (dept) => {
        const totalCases = await Complaint.countDocuments({ department: dept._id });
        const openCases = await Complaint.countDocuments({
          department: dept._id,
          status: { $nin: ['Resolved', 'Closed'] },
        });
        return {
          ...dept.toObject(),
          totalCases,
          openCases,
        };
      })
    );

    res.status(200).json({ success: true, departments: stats });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, headOfficer, slaDaysDefault, categories } = req.body;
    const department = await Department.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description,
      headOfficer: headOfficer || null,
      slaDaysDefault: slaDaysDefault || 14,
      categories: categories || [],
    });

    await logAudit({
      req,
      user: req.user,
      action: 'DEPARTMENT_CREATED',
      resourceType: 'Department',
      resourceId: department._id,
      details: { name: department.name, code: department.code },
    });

    res.status(201).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await Department.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('headOfficer', 'name email designation');

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await logAudit({
      req,
      user: req.user,
      action: 'DEPARTMENT_UPDATED',
      resourceType: 'Department',
      resourceId: department._id,
      details: req.body,
    });

    res.status(200).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};
