import mongoose from 'mongoose';

const complaintMessageSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['admin', 'officer', 'institution'],
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message content cannot be blank'],
      trim: true,
    },
    // CRITICAL: isInternal = true means private officer/admin note; hidden from institution users
    isInternal: {
      type: Boolean,
      default: false,
      index: true,
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        path: String,
        size: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const ComplaintMessage = mongoose.model('ComplaintMessage', complaintMessageSchema);
