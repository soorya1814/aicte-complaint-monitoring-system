import { analyzeComplaint, findSimilarComplaints } from '../services/aiService.js';

export const analyzeComplaintText = async (req, res, next) => {
  try {
    const { title = '', description = '' } = req.body;

    if (!title && !description) {
      return res.status(400).json({
        success: false,
        message: 'Title or description is required for AI analysis.',
      });
    }

    const analysis = await analyzeComplaint(title, description);

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

export const getSimilarComplaints = async (req, res, next) => {
  try {
    const { title, category, complaintId } = req.query;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required to search similar complaints.',
      });
    }

    const similar = await findSimilarComplaints(title, category, complaintId);

    res.status(200).json({
      success: true,
      data: similar,
    });
  } catch (error) {
    next(error);
  }
};
