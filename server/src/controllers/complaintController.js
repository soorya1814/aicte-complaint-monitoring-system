import { Complaint } from '../models/Complaint.js';
import { ComplaintMessage } from '../models/ComplaintMessage.js';
import { ComplaintStatusHistory } from '../models/ComplaintStatusHistory.js';
import { Institution } from '../models/Institution.js';
import { Department } from '../models/Department.js';
import { User } from '../models/User.js';
import { generateReferenceId, calculateDeadline } from '../utils/idGenerator.js';
import { analyzeComplaint } from '../services/aiService.js';
import { createNotification, notifyUsers } from '../services/notificationService.js';
import { logAudit } from '../services/auditService.js';
import { exportComplaintsToCSV } from '../services/exportService.js';

/**
 * Create a new Complaint
 * POST /api/complaints
 */
export const createComplaint = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      priority: requestedPriority,
      departmentId,
      institutionId: customInstitutionId,
      attachments = [],
    } = req.body;

    // Determine target institution
    let institutionId = req.user.institution?._id || req.user.institution;
    if (req.user.role === 'admin' && customInstitutionId) {
      institutionId = customInstitutionId;
    }

    if (!institutionId) {
      return res.status(400).json({
        success: false,
        message: 'Institution profile not found. Please register or associate your account with an institution.',
      });
    }

    // Check for potential duplicate complaint in this institution
    const duplicateWindow = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    const potentialDuplicate = await Complaint.findOne({
      institution: institutionId,
      title: { $regex: new RegExp(`^${title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      createdAt: { $gte: duplicateWindow },
      status: { $nin: ['Closed', 'Resolved'] },
    });

    // Run AI / rule-based triage
    const aiAnalysis = await analyzeComplaint(title, description);

    // Final category, priority, and department
    const finalCategory = category || aiAnalysis.suggestedCategory;
    const finalPriority = requestedPriority || aiAnalysis.suggestedPriority || 'Medium';
    const finalDepartmentId = departmentId || aiAnalysis.suggestedDepartment?._id;

    // Generate unique ID
    const referenceId = await generateReferenceId();
    const deadline = calculateDeadline(finalPriority);

    const complaint = await Complaint.create({
      referenceId,
      title: title.trim(),
      description: description.trim(),
      category: finalCategory,
      subcategory,
      priority: finalPriority,
      priorityRationale: aiAnalysis.priorityRationale,
      institution: institutionId,
      submittedBy: req.user._id,
      department: finalDepartmentId,
      status: 'Submitted',
      deadline,
      attachments,
      aiSummary: aiAnalysis.aiSummary,
      aiConfidence: aiAnalysis.confidenceScore,
      tags: [finalCategory, finalPriority],
    });

    // Record initial status history
    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedByRole: req.user.role,
      action: 'SUBMITTED',
      newStatus: 'Submitted',
      reason: 'Grievance submitted by institution.',
      metadata: { referenceId, priority: finalPriority, category: finalCategory },
    });

    // Notify bureau officers / admins
    if (finalDepartmentId) {
      const bureauOfficers = await User.find({ department: finalDepartmentId, role: 'officer' }).select('_id');
      const officerIds = bureauOfficers.map((o) => o._id);
      await notifyUsers(officerIds, {
        complaintId: complaint._id,
        referenceId: complaint.referenceId,
        title: 'New Complaint Submitted',
        message: `A new case [${referenceId}] "${title.slice(0, 50)}" has been routed to your bureau.`,
        type: 'ASSIGNMENT',
      });
    }

    await logAudit({
      req,
      user: req.user,
      action: 'COMPLAINT_CREATED',
      resourceType: 'Complaint',
      resourceId: complaint._id,
      details: { referenceId, category: finalCategory, priority: finalPriority },
    });

    const populated = await Complaint.findById(complaint._id)
      .populate('institution', 'name aicteId state district')
      .populate('department', 'name code')
      .populate('submittedBy', 'name email designation');

    res.status(201).json({
      success: true,
      message: `Complaint ${referenceId} submitted successfully.`,
      complaint: populated,
      potentialDuplicateWarning: potentialDuplicate
        ? `Warning: A similar open complaint (${potentialDuplicate.referenceId}) was submitted recently by your institution.`
        : null,
      aiAssistance: {
        routedBureau: aiAnalysis.suggestedDepartment?.name,
        confidence: aiAnalysis.confidenceScore,
        summary: aiAnalysis.aiSummary,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Complaints with Server-side Pagination, Multi-Filter, and Search
 * GET /api/complaints
 */
export const getComplaints = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      priority,
      category,
      departmentId,
      institutionId,
      isOverdue,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // 1. Role-based scoping (CRITICAL FOR DATA ISOLATION)
    if (req.user.role === 'institution') {
      const userInstitutionId = req.user.institution?._id || req.user.institution;
      query.institution = userInstitutionId;
    } else if (req.user.role === 'officer') {
      // Officers see complaints assigned to their department or assigned to them
      const userDeptId = req.user.department?._id || req.user.department;
      if (userDeptId) {
        query.department = userDeptId;
      }
    }
    // Admin sees all, but can filter by department or institution
    if (departmentId && req.user.role === 'admin') {
      query.department = departmentId;
    }
    if (institutionId && req.user.role !== 'institution') {
      query.institution = institutionId;
    }

    // 2. Status & Priority Filters
    if (status && status !== 'All') {
      query.status = status;
    }
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    if (category && category !== 'All') {
      query.category = category;
    }

    // 3. Overdue Filter
    if (isOverdue === 'true') {
      query.status = { $nin: ['Resolved', 'Closed'] };
      query.deadline = { $lt: new Date() };
    }

    // 4. Date Range
    if (startDate || endDate) {
      query.submissionDate = {};
      if (startDate) query.submissionDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.submissionDate.$lte = end;
      }
    }

    // 5. Search by Reference ID, Title, or Institution
    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      // Find matching institutions if searching
      const matchingInstitutions = await Institution.find({
        $or: [{ name: searchRegex }, { aicteId: searchRegex }],
      }).select('_id');
      const instIds = matchingInstitutions.map((i) => i._id);

      query.$or = [
        { referenceId: searchRegex },
        { title: searchRegex },
        { category: searchRegex },
        { institution: { $in: instIds } },
      ];
    }

    // 6. Pagination & Sorting
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    const direction = sortOrder === 'asc' ? 1 : -1;

    if (sortBy === 'deadline') {
      sortOptions.deadline = direction;
    } else if (sortBy === 'priority') {
      sortOptions.priority = direction;
    } else if (sortBy === 'title') {
      sortOptions.title = direction;
    } else {
      sortOptions.createdAt = direction;
    }

    const [total, complaints] = await Promise.all([
      Complaint.countDocuments(query),
      Complaint.find(query)
        .populate('institution', 'name aicteId state district')
        .populate('department', 'name code')
        .populate('assignedOfficer', 'name email designation')
        .populate('submittedBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
    ]);

    // Enhance with live overdue flag
    const now = new Date();
    const formattedComplaints = complaints.map((c) => {
      const isCurrentlyOverdue = !['Resolved', 'Closed'].includes(c.status) && c.deadline && now > new Date(c.deadline);
      return {
        ...c.toObject(),
        isOverdue: Boolean(isCurrentlyOverdue),
      };
    });

    res.status(200).json({
      success: true,
      complaints: formattedComplaints,
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

/**
 * Get Complaint by ID
 * GET /api/complaints/:id
 */
export const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id)
      .populate('institution', 'name aicteId state district type address contactEmail contactPhone')
      .populate('department', 'name code slaDaysDefault')
      .populate('assignedOfficer', 'name email designation phone')
      .populate('submittedBy', 'name email designation phone');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint record not found',
      });
    }

    // Role-based authorization check
    if (req.user.role === 'institution') {
      const userInstId = req.user.institution?._id || req.user.institution;
      if (complaint.institution._id.toString() !== userInstId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to view complaints of another institution.',
        });
      }
    } else if (req.user.role === 'officer') {
      const userDeptId = req.user.department?._id || req.user.department;
      if (
        complaint.department &&
        userDeptId &&
        complaint.department._id.toString() !== userDeptId.toString() &&
        complaint.assignedOfficer?._id?.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: This complaint belongs to a different AICTE Bureau.',
        });
      }
    }

    // Timeline / Status History
    const history = await ComplaintStatusHistory.find({ complaint: complaint._id })
      .sort({ timestamp: 1 });

    // Messages / Communications
    const messageQuery = { complaint: complaint._id };
    // CRITICAL: Institution users CANNOT see internal private notes!
    if (req.user.role === 'institution') {
      messageQuery.isInternal = false;
    }

    const messages = await ComplaintMessage.find(messageQuery)
      .populate('sender', 'name email role designation')
      .sort({ createdAt: 1 });

    // Live overdue calculation
    const now = new Date();
    const isCurrentlyOverdue =
      !['Resolved', 'Closed'].includes(complaint.status) &&
      complaint.deadline &&
      now > new Date(complaint.deadline);

    res.status(200).json({
      success: true,
      complaint: {
        ...complaint.toObject(),
        isOverdue: Boolean(isCurrentlyOverdue),
      },
      history,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Complaint Status
 * PATCH /api/complaints/:id/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason, resolutionSummary } = req.body;

    const complaint = await Complaint.findById(id).populate('submittedBy', 'email name');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Only Officer or Admin can change status through this endpoint
    if (req.user.role === 'institution') {
      return res.status(403).json({
        success: false,
        message: 'Institutions cannot directly transition complaint status. Use messages to submit clarifications.',
      });
    }

    const previousStatus = complaint.status;
    complaint.status = status;

    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
      if (resolutionSummary) {
        complaint.resolutionSummary = resolutionSummary;
      }
    }

    await complaint.save();

    // Record Status History
    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedByRole: req.user.role,
      action: status === 'Resolved' ? 'RESOLVED' : 'STATUS_CHANGE',
      previousStatus,
      newStatus: status,
      reason: reason || `Status updated from ${previousStatus} to ${status}`,
      metadata: { resolutionSummary },
    });

    // Notify institution user
    await createNotification({
      recipientId: complaint.submittedBy?._id,
      complaintId: complaint._id,
      referenceId: complaint.referenceId,
      title: `Status Update: ${complaint.referenceId}`,
      message: `Your complaint status has been updated to "${status}". ${reason || ''}`,
      type: status === 'Resolved' ? 'RESOLUTION' : 'STATUS_CHANGE',
    });

    await logAudit({
      req,
      user: req.user,
      action: 'STATUS_UPDATED',
      resourceType: 'Complaint',
      resourceId: complaint._id,
      details: { previousStatus, newStatus: status, reason },
    });

    res.status(200).json({
      success: true,
      message: `Status updated to ${status} successfully.`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign / Reassign Officer or Bureau Routing
 * PATCH /api/complaints/:id/assignment
 */
export const assignComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { departmentId, assignedOfficerId, priority, deadline, note } = req.body;

    // Only Admin or Officer can assign
    if (req.user.role === 'institution') {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    let assignedOfficer = null;
    if (assignedOfficerId) {
      assignedOfficer = await User.findById(assignedOfficerId);
      if (!assignedOfficer || assignedOfficer.role !== 'officer') {
        return res.status(400).json({ success: false, message: 'Assigned user must be a valid officer' });
      }
      complaint.assignedOfficer = assignedOfficer._id;
    }

    if (departmentId) {
      complaint.department = departmentId;
    }

    if (priority) {
      complaint.priority = priority;
      if (!deadline) {
        complaint.deadline = calculateDeadline(priority);
      }
    }

    if (deadline) {
      complaint.deadline = new Date(deadline);
    }

    // Transition to Under Review if still Submitted
    if (complaint.status === 'Submitted') {
      complaint.status = 'Under Review';
    }

    await complaint.save();

    // Log history
    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedByRole: req.user.role,
      action: assignedOfficerId ? 'OFFICER_ASSIGNED' : 'DEPARTMENT_ROUTED',
      previousStatus: complaint.status,
      newStatus: complaint.status,
      reason: note || (assignedOfficer ? `Assigned to ${assignedOfficer.name}` : 'Bureau routing updated'),
      metadata: { assignedOfficerId, departmentId, priority, deadline },
    });

    // Notify assigned officer
    if (assignedOfficer) {
      await createNotification({
        recipientId: assignedOfficer._id,
        complaintId: complaint._id,
        referenceId: complaint.referenceId,
        title: 'Case Assigned to You',
        message: `You have been assigned as lead officer for case [${complaint.referenceId}]: ${complaint.title}`,
        type: 'ASSIGNMENT',
      });
    }

    await logAudit({
      req,
      user: req.user,
      action: 'OFFICER_ASSIGNED',
      resourceType: 'Complaint',
      resourceId: complaint._id,
      details: { assignedOfficer: assignedOfficer?.name, departmentId, priority },
    });

    const updated = await Complaint.findById(id)
      .populate('department', 'name code')
      .populate('assignedOfficer', 'name email designation phone');

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully.',
      complaint: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add Public Message or Internal Officer Note
 * POST /api/complaints/:id/messages
 */
export const addMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message, isInternal = false } = req.body;

    const complaint = await Complaint.findById(id)
      .populate('submittedBy', 'name email')
      .populate('assignedOfficer', 'name email');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Institution users CANNOT create internal notes
    if (req.user.role === 'institution' && isInternal) {
      return res.status(403).json({
        success: false,
        message: 'Institution users can only post public clarification messages.',
      });
    }

    const newMsg = await ComplaintMessage.create({
      complaint: complaint._id,
      sender: req.user._id,
      senderRole: req.user.role,
      senderName: req.user.name,
      message: message.trim(),
      isInternal: Boolean(isInternal),
    });

    // If institution provides clarification while status is 'Awaiting Institution Response',
    // automatically move it back to 'In Progress'
    if (req.user.role === 'institution' && complaint.status === 'Awaiting Institution Response') {
      complaint.status = 'In Progress';
      await complaint.save();

      await ComplaintStatusHistory.create({
        complaint: complaint._id,
        changedBy: req.user._id,
        changedByName: req.user.name,
        changedByRole: req.user.role,
        action: 'CLARIFICATION_PROVIDED',
        previousStatus: 'Awaiting Institution Response',
        newStatus: 'In Progress',
        reason: 'Institution provided clarification response.',
      });

      if (complaint.assignedOfficer) {
        await createNotification({
          recipientId: complaint.assignedOfficer._id,
          complaintId: complaint._id,
          referenceId: complaint.referenceId,
          title: 'Clarification Received',
          message: `Institution replied with clarification on case [${complaint.referenceId}].`,
          type: 'MESSAGE_RECEIVED',
        });
      }
    } else if (!isInternal) {
      // If public message from officer/admin, notify institution
      if (req.user.role !== 'institution' && complaint.submittedBy) {
        await createNotification({
          recipientId: complaint.submittedBy._id,
          complaintId: complaint._id,
          referenceId: complaint.referenceId,
          title: 'New Response from AICTE Officer',
          message: `An officer added a response on case [${complaint.referenceId}].`,
          type: 'MESSAGE_RECEIVED',
        });
      }
    }

    res.status(201).json({
      success: true,
      message: isInternal ? 'Internal note added' : 'Clarification message posted',
      data: newMsg,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reopen a Resolved Complaint
 * POST /api/complaints/:id/reopen
 */
export const reopenComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const complaint = await Complaint.findById(id).populate('assignedOfficer department');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.status !== 'Resolved' && complaint.status !== 'Closed') {
      return res.status(400).json({
        success: false,
        message: 'Only Resolved or Closed complaints can be reopened.',
      });
    }

    // Role check: Institution user who submitted it, or Admin
    if (req.user.role === 'institution') {
      const userInstId = req.user.institution?._id || req.user.institution;
      if (complaint.institution.toString() !== userInstId.toString()) {
        return res.status(403).json({ success: false, message: 'Permission denied.' });
      }
    }

    const previousStatus = complaint.status;
    complaint.status = 'Reopened';
    complaint.reopenReason = reason;
    complaint.reopenedAt = new Date();
    complaint.reopenedCount = (complaint.reopenedCount || 0) + 1;
    // Set renewed deadline (7 days for reopened case)
    complaint.deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await complaint.save();

    await ComplaintStatusHistory.create({
      complaint: complaint._id,
      changedBy: req.user._id,
      changedByName: req.user.name,
      changedByRole: req.user.role,
      action: 'REOPENED',
      previousStatus,
      newStatus: 'Reopened',
      reason: `Reopened by ${req.user.name}: ${reason}`,
    });

    // Notify assigned officer
    if (complaint.assignedOfficer) {
      await createNotification({
        recipientId: complaint.assignedOfficer._id,
        complaintId: complaint._id,
        referenceId: complaint.referenceId,
        title: `Case Reopened: [${complaint.referenceId}]`,
        message: `Institution reopened complaint [${complaint.referenceId}]. Reason: "${reason.slice(0, 100)}"`,
        type: 'STATUS_CHANGE',
      });
    }

    await logAudit({
      req,
      user: req.user,
      action: 'COMPLAINT_REOPENED',
      resourceType: 'Complaint',
      resourceId: complaint._id,
      details: { reason, count: complaint.reopenedCount },
    });

    res.status(200).json({
      success: true,
      message: 'Complaint has been reopened for further bureau examination.',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export filtered complaints to CSV
 * GET /api/reports/complaints.csv
 */
export const exportComplaintsCSV = async (req, res, next) => {
  try {
    const { status, priority, category, departmentId } = req.query;
    const query = {};

    if (req.user.role === 'institution') {
      query.institution = req.user.institution?._id || req.user.institution;
    } else if (req.user.role === 'officer') {
      query.department = req.user.department?._id || req.user.department;
    }

    if (status && status !== 'All') query.status = status;
    if (priority && priority !== 'All') query.priority = priority;
    if (category && category !== 'All') query.category = category;
    if (departmentId && req.user.role === 'admin') query.department = departmentId;

    const complaints = await Complaint.find(query)
      .populate('institution', 'name aicteId state district')
      .populate('department', 'name code')
      .populate('assignedOfficer', 'name email')
      .sort({ createdAt: -1 })
      .limit(5000);

    await logAudit({
      req,
      user: req.user,
      action: 'EXPORT_CSV',
      resourceType: 'Complaint',
      details: { exportedCount: complaints.length, filters: req.query },
    });

    exportComplaintsToCSV(complaints, res);
  } catch (error) {
    next(error);
  }
};
