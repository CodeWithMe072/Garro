import Complaint from '../models/Complaint.js';
import { success, error  } from '../utils/response.js';

export const createComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.create({ ...req.body, customerId: req.user.id });
    success(res, { complaint }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const getComplaints = async (req, res) => {
  try {
    const filter = req.user.role === 'customer' ? { customerId: req.user.id } : {};
    const complaints = await Complaint.find(filter).populate('jobId').populate('customerId', 'name email');
    success(res, { complaints });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const resolveComplaint = async (req, res) => {
  try {
    const { resolutionType, resolution } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { resolutionType, resolution, status: 'resolved' },
      { new: true }
    );
    if (!complaint) return error(res, 'Complaint not found', 404);
    success(res, { complaint });
  } catch (err) {
    error(res, err.message, 500);
  }
};
