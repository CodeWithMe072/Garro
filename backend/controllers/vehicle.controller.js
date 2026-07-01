import Vehicle from '../models/Vehicle.js';
import { success, error  } from '../utils/response.js';

// POST /api/vehicles
export const addVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create({ ...req.body, userId: req.user.id });
    success(res, { vehicle }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/vehicles — customer sees own, admin sees all
export const getVehicles = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user.id };
    const vehicles = await Vehicle.find(filter).populate('userId', 'name email');
    success(res, { vehicles });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/vehicles/:id
export const getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return error(res, 'Vehicle not found', 404);
    success(res, { vehicle });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// PUT /api/vehicles/:id
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vehicle) return error(res, 'Vehicle not found', 404);
    success(res, { vehicle });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// DELETE /api/vehicles/:id
export const deleteVehicle = async (req, res) => {
  try {
    await Vehicle.findByIdAndDelete(req.params.id);
    success(res, { message: 'Vehicle deleted' });
  } catch (err) {
    error(res, err.message, 500);
  }
};
