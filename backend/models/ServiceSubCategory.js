import mongoose from 'mongoose';

const serviceSubCategorySchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
  name:       { type: String, required: true },
  slug:       { type: String, required: true, unique: true },
  isActive:   { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('ServiceSubCategory', serviceSubCategorySchema);
