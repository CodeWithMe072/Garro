import mongoose from 'mongoose';

const helperTrackingSchema = new mongoose.Schema({
  jobId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  helperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Helper', required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  timestamp: { type: Date, default: Date.now }
});

// TTL index — auto-delete tracking records older than 7 days
helperTrackingSchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });

// Index for fast lookup by jobId
helperTrackingSchema.index({ jobId: 1, timestamp: -1 });

export default mongoose.model('HelperTracking', helperTrackingSchema);
