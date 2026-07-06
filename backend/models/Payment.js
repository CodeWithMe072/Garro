import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  invoiceId:             { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: false },
  amount:                { type: Number, required: true },
  method:                { type: String, enum: ['card', 'bank_transfer', 'cash', 'apple_pay', 'google_pay'] },
  status:                { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  stripePaymentIntentId: { type: String },
  stripePaidAt:          { type: Date }
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
