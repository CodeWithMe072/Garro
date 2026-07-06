import mongoose from 'mongoose';

const garagePayoutSchema = new mongoose.Schema({
  garageId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Garage',  required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  jobId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Job',     required: true },

  amount:      { type: Number, required: true }, // 90% of subtotal (parts + labour only)
  status:      { type: String, enum: ['pending', 'processed'], default: 'pending' },
  processedAt: { type: Date },
  notes:       { type: String }
}, { timestamps: true });

export default mongoose.model('GaragePayout', garagePayoutSchema);
