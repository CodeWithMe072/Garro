import mongoose from 'mongoose';

/**
 * ServicePackage — admin-configurable package offerings for public website and booking.
 */
const ServicePackageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'AED'
  },
  icon: {
    type: String,
    default: 'wrench' // 'wrench', 'gear', 'crown', 'car'
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  includesHeader: {
    type: String,
    default: 'Includes:'
  },
  includes: [{
    type: String,
    trim: true
  }],
  bestForNote: {
    type: String,
    default: ''
  },
  buttonText: {
    type: String,
    default: 'Book Now'
  },
  active: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('ServicePackage', ServicePackageSchema);
