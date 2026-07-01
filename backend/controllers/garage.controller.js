import Garage from '../models/Garage.js';
import { success, error  } from '../utils/response.js';

export const createGarage = async (req, res) => {
  try {
    const garage = await Garage.create(req.body);
    success(res, { garage }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const getGarages = async (req, res) => {
  try {
    const garages = await Garage.find();
    success(res, { garages });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const getGarageById = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);
    if (!garage) return error(res, 'Garage not found', 404);
    success(res, { garage });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const updateGarage = async (req, res) => {
  try {
    const garage = await Garage.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!garage) return error(res, 'Garage not found', 404);
    success(res, { garage });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const toggleStatus = async (req, res) => {
  try {
    const garage = await Garage.findById(req.params.id);
    if (!garage) return error(res, 'Garage not found', 404);
    garage.status = garage.status === 'active' ? 'inactive' : 'active';
    await garage.save();
    success(res, { garage });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const deleteGarage = async (req, res) => {
  try {
    const garage = await Garage.findByIdAndDelete(req.params.id);
    if (!garage) return error(res, 'Garage not found', 404);
    success(res, { message: 'Garage removed successfully' });
  } catch (err) {
    error(res, err.message, 500);
  }
};
