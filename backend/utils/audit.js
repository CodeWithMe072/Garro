import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (userId, action, entity, entityId, meta = {}) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      entity,
      entityId,
      meta
    });
    console.log(`[Audit Trail] Logged action "${action}" on ${entity} by user ${userId}`);
  } catch (err) {
    console.error('[Audit Trail] Failed to log activity:', err.message);
  }
};
