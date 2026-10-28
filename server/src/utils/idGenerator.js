import { Complaint } from '../models/Complaint.js';

/**
 * Generates a unique complaint reference ID
 * Format: AICTE-YYYY-XXXXX (e.g. AICTE-2026-08421)
 */
export const generateReferenceId = async () => {
  const year = new Date().getFullYear();
  let isUnique = false;
  let referenceId = '';
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digits
    referenceId = `AICTE-${year}-${randomNum}`;
    
    // Check if exists
    const existing = await Complaint.findOne({ referenceId });
    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  return referenceId;
};

/**
 * Calculates deadline date based on priority
 * Critical: 48 hours (2 days)
 * High: 7 days
 * Medium: 14 days
 * Low: 30 days
 */
export const calculateDeadline = (priority, fromDate = new Date()) => {
  const date = new Date(fromDate);
  switch (priority) {
    case 'Critical':
      date.setHours(date.getHours() + 48);
      break;
    case 'High':
      date.setDate(date.getDate() + 7);
      break;
    case 'Low':
      date.setDate(date.getDate() + 30);
      break;
    case 'Medium':
    default:
      date.setDate(date.getDate() + 14);
      break;
  }
  return date;
};
