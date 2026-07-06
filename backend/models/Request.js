import mongoose from 'mongoose';

const SERVICE_TYPES = ['minor_service', 'major_service', 'ac_repair', 'brake_repair',
  'electrical', 'diagnostics', 'battery', 'other'];

const STATUS_STEPS = [
  'pending_payment', 'new', 'assigned', 'quote_pending', 'quote_sent', 'quote_approved',
  'pickup_scheduled', 'picked_up', 'in_garage', 'repair_in_progress',
  'work_complete', 'ready_for_delivery', 'delivered', 'closed', 'cancelled'
];

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  serviceType: { type: String, enum: SERVICE_TYPES, required: true },
  subCategory: { type: String },
  description: { type: String, required: true },
  status: { type: String, enum: STATUS_STEPS, default: 'pending_payment' },
  photos: [{ type: String }],
  preferredDate: { type: Date },
  urgency: { type: String, enum: ['asap', 'today', 'this_week', 'flexible'], default: 'flexible' },
  proposedDate: { type: Date, default: null },
  proposedDateStatus: { type: String, enum: ['none', 'pending', 'accepted', 'rejected'], default: 'none' },
  location: {
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number }
  },
  assignMode: { type: String, enum: ['auto', 'manual'], default: 'manual' },
  garageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Garage', default: null },
  helperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Helper', default: null },
  scheduledArrivalDate: { type: Date, default: null },
  estimatedDuration: { type: Number, default: null },
  quoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', default: null },
  adminNotes: { type: String }
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);
