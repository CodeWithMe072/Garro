import mongoose from 'mongoose';

const pendingQuoteSchema = new mongoose.Schema({
  quoteToken: { type: String, required: true, unique: true, index: true },
  category: { type: String, default: '' },
  subCategory: { type: String, default: '' },
  carBrand: { type: String, default: '' },
  carModel: { type: String, default: '' },
  carYear: { type: Number, default: 2020 },
  cityName: { type: String, default: 'Dubai' },
  area: { type: String, default: '' },
  problemTitle: { type: String, default: '' },
  phone: { type: String, default: '' },
  urgency: { type: String, default: 'flexible' },
  vinNumber: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-removes after 24 hours
});

export default mongoose.model('PendingQuote', pendingQuoteSchema);
