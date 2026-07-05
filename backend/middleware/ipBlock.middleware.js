import BlockedIp from '../models/BlockedIp.js';
import { error } from '../utils/response.js';

export const checkIpBlock = async (req, res, next) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const blockRecord = await BlockedIp.findOne({ ip });
    
    if (blockRecord && blockRecord.blockedUntil && blockRecord.blockedUntil > Date.now()) {
      const remaining = Math.ceil((blockRecord.blockedUntil - Date.now()) / (60 * 1000));
      return error(res, `Too many wrong OTP attempts. This IP address is blocked. Try again in ${remaining} minutes.`, 403);
    }
    
    next();
  } catch (err) {
    next(err);
  }
};
