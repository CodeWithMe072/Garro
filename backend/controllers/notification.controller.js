import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Request from '../models/Request.js';
import { sendEmail } from '../utils/notify.js';
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

// POST /api/notifications/bulk (Admin only)
export const sendBulkNotification = async (req, res) => {
  try {
    const { target, statusFilter, message, subject } = req.body;
    if (!message) return error(res, 'Message content is required', 400);

    let users = [];
    if (target === 'all') {
      users = await User.find({ role: 'customer', status: 'active' });
    } else if (target === 'by-status' && statusFilter) {
      const requests = await Request.find({ status: statusFilter }).select('userId');
      const userIds = requests.map(r => r.userId);
      users = await User.find({ _id: { $in: userIds }, role: 'customer', status: 'active' });
    } else {
      return error(res, 'Invalid target filter configuration', 400);
    }

    if (users.length === 0) {
      return success(res, { count: 0, message: 'No target customers matched the filters.' });
    }

    const emailSubject = subject || 'Important Update from Garro';
    const emailHtml = `<div style="font-family: Arial, sans-serif; padding: 20px; color: #1a1a2e; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #185FA5;">Notification from Garro</h2>
      <p style="font-size: 15px; line-height: 1.6; color: #475569;">${message}</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 11px; color: #94a3b8; text-align: center;">You received this because you are a registered customer on Garro UAE.</p>
    </div>`;

    // Create notifications in DB
    const notificationsToInsert = users.map(u => ({
      userId: u._id,
      type: 'bulk',
      message: message,
      read: false
    }));

    await Notification.insertMany(notificationsToInsert);

    // Asynchronously send emails in the background
    const emailPromises = users.map(u => 
      sendEmail(u.email, emailSubject, emailHtml)
        .catch(err => console.error(`Failed to send bulk email to ${u.email}:`, err.message))
    );
    
    Promise.all(emailPromises);

    success(res, { count: users.length, message: `Bulk message dispatched successfully to ${users.length} customers.` });
  } catch (err) {
    error(res, err.message, 500);
  }
};
