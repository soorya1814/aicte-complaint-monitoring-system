import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    referenceId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Detailed description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: [true, 'Institution reference is required'],
      index: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Submitting user reference is required'],
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      index: true,
    },
    assignedOfficer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Complaint category is required'],
      trim: true,
      index: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      index: true,
    },
    priorityRationale: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'In Progress',
        'Awaiting Institution Response',
        'Resolved',
        'Closed',
        'Reopened',
      ],
      default: 'Submitted',
      index: true,
    },
    submissionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    deadline: {
      type: Date,
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
    resolutionSummary: {
      type: String,
      trim: true,
    },
    reopenReason: {
      type: String,
      trim: true,
    },
    reopenedAt: {
      type: Date,
    },
    reopenedCount: {
      type: Number,
      default: 0,
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        path: String,
        mimetype: String,
        size: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    isOverdue: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    aiSummary: {
      type: String,
      trim: true,
    },
    aiConfidence: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for fast multi-field search
complaintSchema.index({
  referenceId: 'text',
  title: 'text',
  description: 'text',
  category: 'text',
});

// Helper virtual to check if complaint is currently overdue
complaintSchema.virtual('checkOverdue').get(function () {
  if (['Resolved', 'Closed'].includes(this.status)) {
    return false;
  }
  if (!this.deadline) return false;
  return new Date() > new Date(this.deadline);
});

export const Complaint = mongoose.model('Complaint', complaintSchema);
