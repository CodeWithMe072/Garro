import mongoose from 'mongoose';

const staffInviteSchema = new mongoose.Schema({
  email:       { type: String, required: true, lowercase: true, trim: true },
  role:        { type: String, enum: ['staff', 'helper', 'manager'], default: 'staff' },
  garageId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Garage' },
  department:  { type: String, default: 'General' },
  token:       { type: String, required: true, unique: true },
  status:      { type: String, enum: ['pending', 'used', 'revoked'], default: 'pending' },
  expiresAt:   { type: Date, required: true },
  createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('StaffInvite', staffInviteSchema);
