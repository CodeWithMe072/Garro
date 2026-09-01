import mongoose from 'mongoose';

const garageSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  contactPerson:    { type: String },
  phone:            { type: String, required: true },
  email:            { type: String },
  commissionPercent:{ type: Number, default: 10 },
  services:         [{ type: String }],
  areas:            [{ type: String }],
  documents:        [{ type: mongoose.Schema.Types.Mixed }],
  status:           { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  isOpen:           { type: Boolean, default: true },
  rating:           { type: Number, default: 0 },
  deletionRequest: {
    status:      { type: String, enum: ['none', 'pending', 'approved', 'rejected'], default: 'none' },
    requestedAt: { type: Date },
    reason:      { type: String },
    reviewedAt:  { type: Date },
    adminNotes:  { type: String }
  },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { timestamps: true });

export default mongoose.model('Garage', garageSchema);
