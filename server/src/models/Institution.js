import mongoose from 'mongoose';

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
      index: true,
    },
    aicteId: {
      type: String,
      required: [true, 'AICTE Permanent ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'Engineering & Technology',
        'Management',
        'Pharmacy',
        'Architecture & Planning',
        'Polytechnic / Diploma',
        'MCA & Applied Arts',
        'Hotel Management',
        'Other Technical'
      ],
      default: 'Engineering & Technology',
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      index: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Search index for autocomplete & filters
institutionSchema.index({ name: 'text', aicteId: 'text', state: 'text' });

export const Institution = mongoose.model('Institution', institutionSchema);
