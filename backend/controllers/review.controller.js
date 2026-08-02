import Review from '../models/Review.js';
import Job from '../models/Job.js';
import Garage from '../models/Garage.js';
import Helper from '../models/Helper.js';
import { success, error } from '../utils/response.js';

// POST /api/reviews — create a review
export const createReview = async (req, res) => {
  try {
    const { jobId, garageId, rating, comment } = req.body;
    const customerId = req.user.id;

    let targetGarageId = garageId;
    let targetHelperId = null;

    if (jobId) {
      // Check if review already exists for this job
      const exists = await Review.findOne({ jobId });
      if (exists) {
        return error(res, 'You have already submitted a review for this job', 400);
      }

      const job = await Job.findById(jobId);
      if (!job) return error(res, 'Job not found', 404);

      targetGarageId = job.garageId;
      targetHelperId = job.helperId;
    } else if (!garageId) {
      return error(res, 'Either jobId or garageId is required to submit a review', 400);
    }

    const review = await Review.create({
      customerId,
      garageId: targetGarageId,
      helperId: targetHelperId,
      jobId: jobId || null,
      rating: Number(rating),
      comment
    });

    // Update Garage average rating
    if (targetGarageId) {
      const garageReviews = await Review.find({ garageId: targetGarageId });
      const avg = garageReviews.reduce((sum, r) => sum + r.rating, 0) / garageReviews.length;
      await Garage.findByIdAndUpdate(targetGarageId, { rating: parseFloat(avg.toFixed(1)) });
    }

    // Update Helper average rating
    if (targetHelperId) {
      const helperReviews = await Review.find({ helperId: targetHelperId });
      const avg = helperReviews.reduce((sum, r) => sum + r.rating, 0) / helperReviews.length;
      await Helper.findByIdAndUpdate(targetHelperId, { rating: parseFloat(avg.toFixed(1)) });
    }

    success(res, { review, message: 'Review submitted successfully' }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/reviews/my — get reviews submitted by current customer
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ customerId: req.user.id })
      .populate('garageId', 'name')
      .populate('helperId', 'name')
      .populate({
        path: 'jobId',
        populate: { path: 'requestId', populate: { path: 'vehicleId', select: 'make model' } }
      })
      .sort({ createdAt: -1 });
    success(res, { reviews });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/reviews/garage/:garageId — get reviews for a garage
export const getGarageReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ garageId: req.params.garageId })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });
    success(res, { reviews });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/reviews/helper/:helperId — get reviews for a helper
export const getHelperReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ helperId: req.params.helperId })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });
    success(res, { reviews });
  } catch (err) {
    error(res, err.message, 500);
  }
};
