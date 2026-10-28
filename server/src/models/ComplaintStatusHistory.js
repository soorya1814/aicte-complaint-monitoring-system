import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changedByName: {
      type: String,
      required: true,
    },
    changedByRole: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: [
        'SUBMITTED',
        'STATUS_CHANGE',
        'OFFICER_ASSIGNED',
        'OFFICER_REASSIGNED',
        'DEPARTMENT_ROUTED',
        'PRIORITY_UPDATED',
        'DEADLINE_EXTENDED',
        'CLARIFICATION_REQUESTED',
        'CLARIFICATION_PROVIDED',
        'RESOLVED',
        'REOPENED',
        'CLOSED',
      ],
      required: true,
    },
    previousStatus: {
      type: String,
    },
    newStatus: {
      type: String,
    },
    reason: {
      type: String,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ComplaintStatusHistory = mongoose.model('ComplaintStatusHistory', statusHistorySchema);
