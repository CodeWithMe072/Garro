import mongoose from 'mongoose';

const SERVICE_TYPES = ['minor_service', 'major_service', 'ac_repair', 'brake_repair',
  'electrical', 'diagnostics', 'battery', 'emergency_pickup', 'roadside_assistance', 'other'];

const STATUS_STEPS = [
  'pending_payment', 'new', 'assigned', 'quote_pending', 'quote_sent', 'quote_approved',
  'pickup_scheduled', 'picked_up', 'in_garage', 'repair_in_progress',
  'work_complete', 'ready_for_delivery', 'delivered', 'closed', 'cancelled',
  'cancellation_requested'
];

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  serviceType: { type: String, enum: SERVICE_TYPES, required: true },
  subCategory: { type: String },
  description: { type: String, required: true },
  status: { type: String, enum: STATUS_STEPS, default: 'pending_payment' },
  previousStatus: { type: String, default: null },
  cancellationReason: { type: String, default: '' },
  cancellationRequestedAt: { type: Date, default: null },
  refundStatus: { type: String, enum: ['none', 'requested', 'approved', 'processed', 'rejected'], default: 'none' },
  refundAmount: { type: Number, default: 0 },
  refundedAt: { type: Date, default: null },
  // Audit trail — who acted and when
  refundApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  refundApprovedAt: { type: Date, default: null },
  refundRejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  refundRejectedAt: { type: Date, default: null },
  // Set true when Stripe call was skipped (bypass_/mock_ payment intent)
  isMockTransaction: { type: Boolean, default: false },
  photos: [{ type: String }],
  preferredDate: { type: Date },
  urgency: { type: String, enum: ['asap', 'today', 'this_week', 'flexible'], default: 'flexible' },
  proposedDate: { type: Date, default: null },
  proposedDateStatus: { type: String, enum: ['none', 'pending', 'accepted', 'rejected'], default: 'none' },
  location: {
    address: { type: String },
    city: { type: String, default: 'Dubai' },
    area: { type: String, default: '' },
    standardLocation: { type: String, default: '' },
    strandedLocation: { type: String, default: '' },
    lat: { type: Number },
    lng: { type: Number },
    isGpsUsed: { type: Boolean, default: false }
  },
  assignMode: { type: String, enum: ['auto', 'manual'], default: 'manual' },
  garageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Garage', default: null },
  helperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Helper', default: null },
  scheduledArrivalDate: { type: Date, default: null },
  estimatedDuration: { type: Number, default: null },
  quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', default: null },
  adminNotes: { type: String },
  statusHistory: [{
    status: { type: String },
    changedBy: { type: String, default: 'system' },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, default: '' }
  }]
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);
