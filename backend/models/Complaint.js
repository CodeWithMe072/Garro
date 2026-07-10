import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  jobId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  customerId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description:    { type: String, required: true },
  status:         { type: String, enum: ['open','under_review','resolved','closed'], default: 'open' },
  resolution:     {
    type:       { type: String, enum: ["refund", "compensation", "fix_at_garage", "replacement", "no_action"] },
    amount:     { type: Number },
    notes:      { type: String },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolvedAt: { type: Date }
  }
}, { timestamps: true });

export default mongoose.model('Complaint', complaintSchema);
