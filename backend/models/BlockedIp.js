import mongoose from 'mongoose';

const blockedIpSchema = new mongoose.Schema({
  ip:           { type: String, required: true, unique: true },
  attempts:     { type: Number, default: 0 },
  blockedUntil: { type: Date }
}, { timestamps: true });

export default mongoose.model('BlockedIp', blockedIpSchema);
