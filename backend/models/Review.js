import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  garageId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Garage', default: null },
  helperId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Helper', default: null },
  jobId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
