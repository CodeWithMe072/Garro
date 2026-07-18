import mongoose from 'mongoose';

const supportConversationSchema = new mongoose.Schema({
  customerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  status:          { type: String, enum: ['open', 'closed'], default: 'open' },
  lastMessage:     { type: String, default: '' },
  lastMessageAt:   { type: Date, default: Date.now },
  lastSenderRole:  { type: String, enum: ['customer', 'agent'], default: 'customer' },
  unreadByAgent:   { type: Number, default: 0 },
  unreadByCustomer:{ type: Number, default: 0 },
  claimedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // optional: which agent is handling it
}, { timestamps: true });

export default mongoose.model('SupportConversation', supportConversationSchema);
