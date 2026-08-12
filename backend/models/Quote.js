import mongoose from 'mongoose';
import { getSetting } from '../utils/settings.js';

const quoteSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  garageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Garage', required: false },
  partsCost: { type: Number, required: true },
  laborCost: { type: Number, required: true },
  servicePrice: { type: Number, default: 0 },
  machineCostPerService: { type: Number, default: 0 },
  subtotal: { type: Number },
  serviceFee: { type: Number },
  vat: { type: Number },
  customerTotal: { type: Number },
  margin: { type: Number, default: 0 }, // Single Source of Truth: (customerTotal - garageQuote/subtotal) / customerTotal
  status: { type: String, enum: ['pending', 'sent', 'approved', 'rejected', 'paid'], default: 'pending' },
  validUntil: { type: Date }
}, { timestamps: true });

// Shared margin calculation logic
export const computeMargin = (subtotal, customerTotal) => {
  if (!customerTotal || customerTotal <= 0) return 0;
  const marginVal = (customerTotal - subtotal) / customerTotal;
  return parseFloat(marginVal.toFixed(4));
};

// Auto-calculate before save
quoteSchema.pre('save', function () {
  const serviceFeePercent = getSetting('serviceFeePercentage', 10);
  const vatPercent = getSetting('vatPercentage', 5);

  this.subtotal = (Number(this.partsCost) || 0) + (Number(this.laborCost) || 0) + (Number(this.servicePrice) || 0) + (Number(this.machineCostPerService) || 0);
  this.serviceFee = parseFloat((this.subtotal * (serviceFeePercent / 100)).toFixed(2));
  this.vat = parseFloat(((this.subtotal + this.serviceFee) * (vatPercent / 100)).toFixed(2));
  this.customerTotal = parseFloat((this.subtotal + this.serviceFee + this.vat).toFixed(2));
  this.margin = computeMargin(this.subtotal, this.customerTotal);

  if (!this.validUntil) {
    this.validUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  }
});

export default mongoose.model('Quote', quoteSchema);
