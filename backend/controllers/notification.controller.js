import Notification from '../models/Notification.js';
import { success, error } from '../utils/response.js';

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    success(res, { notifications });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PUT /api/notifications/:id/read
export const markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) return error(res, 'Notification not found', 404);
    success(res, { notification });
  } catch (err) {
    error(res, err.message, 500);
  }
};
