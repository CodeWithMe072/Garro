import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
  cityId:   { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  name:     { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Prevent duplicate area names under the same city
areaSchema.index({ cityId: 1, name: 1 }, { unique: true });

export default mongoose.model('Area', areaSchema);
