import Review from '../models/Review.js';
import Job from '../models/Job.js';
import Garage from '../models/Garage.js';
import Helper from '../models/Helper.js';
import { success, error } from '../utils/response.js';

// POST /api/reviews — create a review
export const createReview = async (req, res) => {
  try {
    const { jobId, rating, comment } = req.body;
    const customerId = req.user.id;

    // Check if review already exists for this job
    const exists = await Review.findOne({ jobId });
    if (exists) {
      return error(res, 'You have already submitted a review for this job', 400);
    }

    const job = await Job.findById(jobId);
    if (!job) return error(res, 'Job not found', 404);

    const review = await Review.create({
      customerId,
      garageId: job.garageId,
      helperId: job.helperId,
      jobId,
      rating: Number(rating),
      comment
    });

    // Update Garage average rating
    if (job.garageId) {
      const garageReviews = await Review.find({ garageId: job.garageId });
      const avg = garageReviews.reduce((sum, r) => sum + r.rating, 0) / garageReviews.length;
      await Garage.findByIdAndUpdate(job.garageId, { rating: parseFloat(avg.toFixed(1)) });
    }

    // Update Helper average rating
    if (job.helperId) {
      const helperReviews = await Review.find({ helperId: job.helperId });
      const avg = helperReviews.reduce((sum, r) => sum + r.rating, 0) / helperReviews.length;
      await Helper.findByIdAndUpdate(job.helperId, { rating: parseFloat(avg.toFixed(1)) });
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
