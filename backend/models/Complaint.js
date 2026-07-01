import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  jobId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  customerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description:    { type: String, required: true },
  status:         { type: String, enum: ['open','under_review','resolved','closed'], default: 'open' },
  resolutionType: { type: String, enum: ['fix_at_garage','partial_refund','full_refund','compensation'] },
  resolution:     { type: String }
}, { timestamps: true });

export default mongoose.model('Complaint', complaintSchema);
