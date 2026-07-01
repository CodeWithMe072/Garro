import Helper from '../models/Helper.js';
import { success, error  } from '../utils/response.js';

export const createHelper = async (req, res) => {
  try {
    const helper = await Helper.create(req.body);
    success(res, { helper }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const getHelpers = async (req, res) => {
  try {
    const { available } = req.query;
    const filter = available === 'true' ? { isAvailable: true } : {};
    const helpers = await Helper.find(filter).populate('garageId', 'name');
    success(res, { helpers });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const updateHelper = async (req, res) => {
  try {
    const helper = await Helper.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!helper) return error(res, 'Helper not found', 404);
    success(res, { helper });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const toggleAvailability = async (req, res) => {
  try {
    const helper = await Helper.findById(req.params.id);
    if (!helper) return error(res, 'Helper not found', 404);
    helper.isAvailable = !helper.isAvailable;
    await helper.save();
    success(res, { helper });
  } catch (err) {
    error(res, err.message, 500);
  }
};
