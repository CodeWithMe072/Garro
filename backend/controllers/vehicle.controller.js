import Vehicle from '../models/Vehicle.js';
import Brand from '../models/Brand.js';
import VehicleModel from '../models/VehicleModel.js';
import ServiceCategory from '../models/ServiceCategory.js';
import ServiceSubCategory from '../models/ServiceSubCategory.js';
import City from '../models/City.js';
import Area from '../models/Area.js';
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

// GET /api/vehicles/catalog/brands
export const getActiveBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
    const models = await VehicleModel.find({ isActive: true }).sort({ name: 1 });

    const brandsWithModels = brands.map(brand => ({
      _id: brand._id,
      name: brand.name,
      models: models
        .filter(m => m.brandId.toString() === brand._id.toString())
        .map(m => ({ _id: m._id, name: m.name }))
    }));

    success(res, { brands: brandsWithModels });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/vehicles/catalog/services
export const getActiveServices = async (req, res) => {
  try {
    const categories = await ServiceCategory.find({ isActive: true }).sort({ name: 1 });
    const subcategories = await ServiceSubCategory.find({ isActive: true }).sort({ name: 1 });

    const categoriesWithSubs = categories.map(cat => ({
      _id: cat._id,
      name: cat.name,
      slug: cat.slug,
      subCategories: subcategories
        .filter(sub => sub.categoryId.toString() === cat._id.toString())
        .map(sub => ({ _id: sub._id, name: sub.name, slug: sub.slug }))
    }));

    success(res, { categories: categoriesWithSubs });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/vehicles/catalog/locations
export const getActiveLocations = async (req, res) => {
  try {
    const cities = await City.find({ isActive: true }).sort({ name: 1 });
    const areas = await Area.find({ isActive: true }).sort({ name: 1 });

    const citiesWithAreas = cities.map(city => ({
      _id: city._id,
      name: city.name,
      areas: areas
        .filter(a => a.cityId.toString() === city._id.toString())
        .map(a => ({ _id: a._id, name: a.name }))
    }));

    success(res, { cities: citiesWithAreas });
  } catch (err) {
    error(res, err.message, 500);
  }
};
