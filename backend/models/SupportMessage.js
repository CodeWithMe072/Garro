import mongoose from 'mongoose';

const supportMessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportConversation', required: true, index: true },
  senderId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole:     { type: String, enum: ['customer', 'admin', 'staff', 'manager', 'superadmin'], required: true },
  text:           { type: String, required: true, trim: true, maxlength: 2000 },
  read:           { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('SupportMessage', supportMessageSchema);
