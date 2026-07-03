import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  userId:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  make:               { type: String, required: true },
  model:              { type: String, required: true },
  year:               { type: Number, required: true },
  engineType:         { type: String },
  registrationNumber: { type: String, required: true },
  VIN:                { type: String },
  isActive:           { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);
