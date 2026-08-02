import mongoose from 'mongoose';

const garagePayoutSchema = new mongoose.Schema({
  garageId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Garage',  required: true },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  jobId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Job',     required: true },

  amount:      { type: Number, required: true }, // Net payout: subtotal − 10% platform fee − 5% VAT
  status:      { type: String, enum: ['pending', 'processing', 'processed', 'failed', 'on_hold', 'needs_review'], default: 'pending' },
  processedAt: { type: Date },
  notes:       { type: String },

  // Audit trail — admin who triggered processing
  processedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Stripe Connect transfer ID — used for webhook reconciliation
  stripeTransferId: { type: String, default: null },
  // Set true when Stripe call was skipped (no stripeAccountId / dev mode)
  isMockTransaction: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('GaragePayout', garagePayoutSchema);
