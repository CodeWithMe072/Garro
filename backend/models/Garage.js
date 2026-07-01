import mongoose from 'mongoose';

const garageSchema = new mongoose.Schema({
  name:             { type: String, required: true },
  contactPerson:    { type: String },
  phone:            { type: String, required: true },
  email:            { type: String },
  commissionPercent:{ type: Number, default: 10 },
  services:         [{ type: String }],
  areas:            [{ type: String }],
  status:           { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  rating:           { type: Number, default: 0 },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, { timestamps: true });

export default mongoose.model('Garage', garageSchema);
