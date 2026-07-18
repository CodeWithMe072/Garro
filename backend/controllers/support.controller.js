import SupportConversation from '../models/SupportConversation.js';
import SupportMessage from '../models/SupportMessage.js';
import { success, error } from '../utils/response.js';

// Helper roles definition
const AGENT_ROLES = ['admin', 'staff', 'manager', 'superadmin'];

// Helper to check if role is agent
const isAgent = (role) => AGENT_ROLES.includes(role);

// GET /api/support/conversations/mine
export const getMineConversation = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return error(res, 'Only customers can use this endpoint', 403);
    }

    let conversation = await SupportConversation.findOne({ customerId: req.user.id });
    if (!conversation) {
      conversation = await SupportConversation.create({ customerId: req.user.id });
    }

    success(res, { conversation });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/support/conversations/mine/messages
export const getMineMessages = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return error(res, 'Only customers can use this endpoint', 403);
    }

    const conversation = await SupportConversation.findOne({ customerId: req.user.id });
    if (!conversation) {
      return success(res, { messages: [] });
    }

    const query = { conversationId: conversation._id };
    if (req.query.before) {
      query.createdAt = { $lt: new Date(req.query.before) };
    }

    const limit = parseInt(req.query.limit, 10) || 30;
    const messages = await SupportMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    messages.reverse();
    success(res, { messages });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/support/conversations/mine/messages
export const postMineMessage = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return error(res, 'Only customers can use this endpoint', 403);
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return error(res, 'Message text is required', 400);
    }

    let conversation = await SupportConversation.findOne({ customerId: req.user.id });
    if (!conversation) {
      conversation = await SupportConversation.create({ customerId: req.user.id });
    }

    const message = await SupportMessage.create({
      conversationId: conversation._id,
      senderId: req.user.id,
      senderRole: req.user.role,
      text: text.trim()
    });

    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();
    conversation.lastSenderRole = 'customer';
    conversation.unreadByAgent += 1;
    conversation.status = 'open'; // Re-open conversation if it was closed
    await conversation.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`support:${conversation._id}`).to('support:agents').emit('support:message:new', {
        conversationId: conversation._id,
        message
      });

      const populatedConversation = await SupportConversation.findById(conversation._id)
        .populate('customerId', 'name email phone');
      io.to('support:agents').emit('support:conversation:updated', {
        conversation: populatedConversation
      });
    }

    success(res, { message }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/support/conversations
export const getConversations = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }

    const conversations = await SupportConversation.find(query)
      .sort({ lastMessageAt: -1 })
      .populate('customerId', 'name email phone');

    success(res, { conversations });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/support/conversations/:id/messages
export const getConversationMessages = async (req, res) => {
  try {
    const query = { conversationId: req.params.id };
    if (req.query.before) {
      query.createdAt = { $lt: new Date(req.query.before) };
    }

    const limit = parseInt(req.query.limit, 10) || 30;
    const messages = await SupportMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    messages.reverse();
    success(res, { messages });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/support/conversations/:id/messages
export const postAgentMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return error(res, 'Message text is required', 400);
    }

    const conversation = await SupportConversation.findById(req.params.id);
    if (!conversation) {
      return error(res, 'Conversation not found', 404);
    }

    const message = await SupportMessage.create({
      conversationId: conversation._id,
      senderId: req.user.id,
      senderRole: req.user.role,
      text: text.trim()
    });

    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();
    conversation.lastSenderRole = 'agent';
    conversation.unreadByCustomer += 1;
    await conversation.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`support:${conversation._id}`).to('support:agents').emit('support:message:new', {
        conversationId: conversation._id,
        message
      });

      const populatedConversation = await SupportConversation.findById(conversation._id)
        .populate('customerId', 'name email phone');
      io.to('support:agents').emit('support:conversation:updated', {
        conversation: populatedConversation
      });
    }

    success(res, { message }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PATCH /api/support/conversations/:id/read
export const markRead = async (req, res) => {
  try {
    const conversation = await SupportConversation.findById(req.params.id);
    if (!conversation) {
      return error(res, 'Conversation not found', 404);
    }

    if (req.user.role === 'customer') {
      conversation.unreadByCustomer = 0;
    } else {
      conversation.unreadByAgent = 0;
    }
    await conversation.save();

    const io = req.app.get('io');
    if (io) {
      const populatedConversation = await SupportConversation.findById(conversation._id)
        .populate('customerId', 'name email phone');
      io.to('support:agents').emit('support:conversation:updated', {
        conversation: populatedConversation
      });
    }

    success(res, { conversation });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PATCH /api/support/conversations/:id/close
export const closeConversation = async (req, res) => {
  try {
    const conversation = await SupportConversation.findById(req.params.id);
    if (!conversation) {
      return error(res, 'Conversation not found', 404);
    }

    conversation.status = 'closed';
    await conversation.save();

    const io = req.app.get('io');
    if (io) {
      const populatedConversation = await SupportConversation.findById(conversation._id)
        .populate('customerId', 'name email phone');
      io.to('support:agents').emit('support:conversation:updated', {
        conversation: populatedConversation
      });
    }

    success(res, { conversation });
  } catch (err) {
    error(res, err.message, 500);
  }
};
