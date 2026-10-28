import { Institution } from '../models/Institution.js';
import { Complaint } from '../models/Complaint.js';
import { logAudit } from '../services/auditService.js';

export const getInstitutions = async (req, res, next) => {
  try {
    const { search, state, type, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { aicteId: regex }, { district: regex }];
    }
    if (state && state !== 'All') query.state = state;
    if (type && type !== 'All') query.type = type;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const [total, institutions] = await Promise.all([
      Institution.countDocuments(query),
      Institution.find(query)
        .sort({ name: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
    ]);

    // Attach complaint counts
    const enriched = await Promise.all(
      institutions.map(async (inst) => {
        const complaintCount = await Complaint.countDocuments({ institution: inst._id });
        return {
          ...inst.toObject(),
          complaintCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      institutions: enriched,
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

export const createInstitution = async (req, res, next) => {
  try {
    const institution = await Institution.create(req.body);

    await logAudit({
      req,
      user: req.user,
      action: 'INSTITUTION_CREATED',
      resourceType: 'Institution',
      resourceId: institution._id,
      details: { name: institution.name, aicteId: institution.aicteId },
    });

    res.status(201).json({ success: true, institution });
  } catch (error) {
    next(error);
  }
};

export const updateInstitution = async (req, res, next) => {
  try {
    const { id } = req.params;
    const institution = await Institution.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found' });
    }

    await logAudit({
      req,
      user: req.user,
      action: 'INSTITUTION_UPDATED',
      resourceType: 'Institution',
      resourceId: institution._id,
      details: req.body,
    });

    res.status(200).json({ success: true, institution });
  } catch (error) {
    next(error);
  }
};
