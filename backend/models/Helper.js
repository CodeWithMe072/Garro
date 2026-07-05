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
  totalJobs:       { type: Number, default: 0 },
  workingHours: {
    timezone: { type: String, default: 'Asia/Dubai' },
    schedule: {
      type: [{
        day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
        isWorking: { type: Boolean, default: true },
        startTime: { type: String, default: '09:00' },
        endTime: { type: String, default: '21:00' }
      }],
      default: () => [
        { day: 'monday', isWorking: true, startTime: '09:00', endTime: '21:00' },
        { day: 'tuesday', isWorking: true, startTime: '09:00', endTime: '21:00' },
        { day: 'wednesday', isWorking: true, startTime: '09:00', endTime: '21:00' },
        { day: 'thursday', isWorking: true, startTime: '09:00', endTime: '21:00' },
        { day: 'friday', isWorking: true, startTime: '09:00', endTime: '21:00' },
        { day: 'saturday', isWorking: true, startTime: '09:00', endTime: '21:00' },
        { day: 'sunday', isWorking: true, startTime: '09:00', endTime: '21:00' }
      ]
    }
  }
}, { timestamps: true });

export default mongoose.model('Helper', helperSchema);
