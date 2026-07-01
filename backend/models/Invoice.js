import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  jobId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  amount:  { type: Number, required: true },
  vat:     { type: Number, required: true },
  total:   { type: Number, required: true },
  status:  { type: String, enum: ['pending','paid','overdue'], default: 'pending' },
  dueDate: { type: Date }
}, { timestamps: true });

export default mongoose.model('Invoice', invoiceSchema);
