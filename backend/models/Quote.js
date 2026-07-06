import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  garageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Garage', required: false },
  partsCost: { type: Number, required: true },
  laborCost: { type: Number, required: true },
  subtotal: { type: Number },
  serviceFee: { type: Number },
  vat: { type: Number },
  customerTotal: { type: Number },
  status: { type: String, enum: ['pending', 'sent', 'approved', 'rejected', 'paid'], default: 'pending' },
  validUntil: { type: Date }
}, { timestamps: true });

// Auto-calculate before save
quoteSchema.pre('save', function () {
  this.subtotal = this.partsCost + this.laborCost;
  this.serviceFee = parseFloat((this.subtotal * 0.10).toFixed(2));
  this.vat = parseFloat(((this.subtotal + this.serviceFee) * 0.05).toFixed(2));
  this.customerTotal = parseFloat((this.subtotal + this.serviceFee + this.vat).toFixed(2));
  if (!this.validUntil) {
    this.validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  }
});

export default mongoose.model('Quote', quoteSchema);
