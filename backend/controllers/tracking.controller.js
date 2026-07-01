import HelperTracking from '../models/HelperTracking.js';
import Helper from '../models/Helper.js';
import { success, error  } from '../utils/response.js';

// POST /api/tracking/update — REST fallback if socket unavailable
export const updateLocation = async (req, res) => {
  try {
    const { jobId, helperId, lat, lng } = req.body;

    await HelperTracking.create({ jobId, helperId, location: { lat, lng } });
    await Helper.findByIdAndUpdate(helperId, { currentLocation: { lat, lng } });

    // Emit to socket room too
    const io = req.app.get('io');
    if (io) {
      io.to(`job:${jobId}`).emit('location:update', { jobId, lat, lng, timestamp: new Date() });
    }

    success(res, { message: 'Location updated' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/tracking/:jobId/latest — current helper pin
export const getLatestLocation = async (req, res) => {
  try {
    const latest = await HelperTracking
      .findOne({ jobId: req.params.jobId })
      .sort({ timestamp: -1 });
    success(res, { location: latest });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/tracking/:jobId/history — last 20 points (breadcrumb trail)
export const getLocationHistory = async (req, res) => {
  try {
    const history = await HelperTracking
      .find({ jobId: req.params.jobId })
      .sort({ timestamp: -1 })
      .limit(20);
    success(res, { history });
  } catch (err) {
    error(res, err.message, 500);
  }
};
