import mongoose from 'mongoose';

const serviceCategorySchema = new mongoose.Schema({
  name:     { type: String, required: true },
  slug:     { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('ServiceCategory', serviceCategorySchema);
