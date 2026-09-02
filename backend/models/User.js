import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  phone:    { type: String, required: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['customer', 'admin', 'helper', 'garage', 'superadmin', 'manager', 'staff'], default: 'customer' },
  status:   { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
  dutyStatus: { type: String, enum: ['on_duty', 'off_duty'], default: 'on_duty' },
  garageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Garage' },
  department: { type: String, default: 'General' },
  employeeId: { type: String },
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
  },
  lockUntil:        { type: Date },
  wrongOtpAttempts: { type: Number, default: 0 },
  resetPasswordToken:   { type: String },
  resetPasswordExpires: { type: Date },
  favoriteLocations: [{
    label:   { type: String, required: true },
    address: { type: String, required: true },
    lat:     { type: Number },
    lng:     { type: Number }
  }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
