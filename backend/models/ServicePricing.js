import mongoose from 'mongoose';

/**
 * ServicePricing — admin-configurable price table for each service type.
 * Replaces the hardcoded serviceTypeCosts object in request.controller.js
 */
const ServicePricingSchema = new mongoose.Schema({
  serviceType: {
    type: String,
    required: true,
    unique: true,
    enum: ['minor_service', 'major_service', 'brake_repair', 'battery', 'ac_repair', 'electrical', 'diagnostics', 'other']
  },
  label: { type: String, required: true },         // Human-readable label shown to admin
  partsCost: { type: Number, default: 0, min: 0 }, // Base parts cost
  laborCost: { type: Number, required: true, min: 0 }, // Base labor cost
  durationHours: { type: Number, default: 2, min: 0.5 }
}, { timestamps: true });

// Virtual: total before VAT
ServicePricingSchema.virtual('baseTotal').get(function () {
  return this.partsCost + this.laborCost;
});

export default mongoose.model('ServicePricing', ServicePricingSchema);
