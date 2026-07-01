import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  phone:    { type: String, required: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['customer', 'admin', 'helper', 'garage', 'superadmin', 'manager', 'staff'], default: 'customer' },
  status:   { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },
  garageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Garage' },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
