import mongoose from 'mongoose';

const helperSchema = new mongoose.Schema({
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:            { type: String, required: true },
  phone:           { type: String, required: true },
  garageId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Garage', required: true },
  isAvailable:     { type: Boolean, default: true },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number }
  },
  activeJobId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
  rating:          { type: Number, default: 5 },
  totalJobs:       { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Helper', helperSchema);
