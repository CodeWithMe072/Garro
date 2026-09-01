import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Garage from '../models/Garage.js';

export default async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Verify User & Garage Active Status
    const user = await User.findById(decoded.id).select('status role garageId');
    if (!user || user.status === 'banned') {
      return res.status(403).json({ success: false, message: 'Access revoked. Account has been closed. Contact Admin to reopen.' });
    }

    if (user.garageId) {
      const garage = await Garage.findById(user.garageId).select('status deletionRequest');
      if (garage && (garage.status === 'inactive' || garage.deletionRequest?.status === 'approved')) {
        return res.status(403).json({ success: false, message: 'Access revoked. Your garage account has been closed by Admin.' });
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
