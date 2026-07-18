import express from 'express';
import auth from '../middleware/auth.middleware.js';
import role from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/support.controller.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Customer endpoints
router.get('/conversations/mine', ctrl.getMineConversation);
router.get('/conversations/mine/messages', ctrl.getMineMessages);
router.post('/conversations/mine/messages', ctrl.postMineMessage);

// Shared endpoints (role determines reset behavior in controller)
router.patch('/conversations/:id/read', ctrl.markRead);

// Agent-only endpoints
const AGENTS = ['admin', 'staff', 'manager', 'superadmin'];
router.get('/conversations', role(...AGENTS), ctrl.getConversations);
router.get('/conversations/:id/messages', role(...AGENTS), ctrl.getConversationMessages);
router.post('/conversations/:id/messages', role(...AGENTS), ctrl.postAgentMessage);
router.patch('/conversations/:id/close', role(...AGENTS), ctrl.closeConversation);

export default router;
