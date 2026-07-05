import mongoose from 'mongoose';

const helperBookingSlotSchema = new mongoose.Schema({
  helperId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Helper', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  date:      { type: Date, required: true },
  startTime: { type: Date, required: true },
  endTime:   { type: Date, required: true },
  status:    { type: String, enum: ['reserved', 'in_progress', 'completed', 'cancelled'], default: 'reserved' }
}, { timestamps: true });

export default mongoose.model('HelperBookingSlot', helperBookingSlotSchema);
