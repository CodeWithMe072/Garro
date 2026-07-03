import Vehicle from '../models/Vehicle.js';
import Brand from '../models/Brand.js';
import VehicleModel from '../models/VehicleModel.js';
import ServiceCategory from '../models/ServiceCategory.js';
import ServiceSubCategory from '../models/ServiceSubCategory.js';
import City from '../models/City.js';
import Area from '../models/Area.js';
import { success, error } from '../utils/response.js';

// ==================== VEHICLES (CUSTOMER VEHICLES) ====================

export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });
    success(res, { vehicles });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vehicle) return error(res, 'Vehicle not found', 404);
    success(res, { vehicle });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const toggleVehicleStatus = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return error(res, 'Vehicle not found', 404);
    vehicle.isActive = !vehicle.isActive;
    await vehicle.save();
    success(res, { vehicle });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return error(res, 'Vehicle not found', 404);
    success(res, { message: 'Vehicle deleted successfully' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// ==================== BRANDS & VEHICLE MODELS ====================

export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    const models = await VehicleModel.find().sort({ name: 1 });
    
    // Group models by brandId for convenience
    const brandsWithModels = brands.map(brand => {
      return {
        ...brand.toObject(),
        models: models.filter(m => m.brandId.toString() === brand._id.toString())
      };
    });

    success(res, { brands: brandsWithModels });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const createBrand = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const brand = await Brand.create({ name, isActive });
    success(res, { brand }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!brand) return error(res, 'Brand not found', 404);
    success(res, { brand });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return error(res, 'Brand not found', 404);
    // Cascade delete models
    await VehicleModel.deleteMany({ brandId: brand._id });
    success(res, { message: 'Brand and its models deleted successfully' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const createModel = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const model = await VehicleModel.create({
      brandId: req.params.brandId,
      name,
      isActive
    });
    success(res, { model }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const updateModel = async (req, res) => {
  try {
    const model = await VehicleModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!model) return error(res, 'Model not found', 404);
    success(res, { model });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const deleteModel = async (req, res) => {
  try {
    const model = await VehicleModel.findByIdAndDelete(req.params.id);
    if (!model) return error(res, 'Model not found', 404);
    success(res, { message: 'Model deleted successfully' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// ==================== SERVICE CATEGORIES & SUB-CATEGORIES ====================

export const getCategories = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({ name: 1 });
    const subCategories = await ServiceSubCategory.find().sort({ name: 1 });

    const categoriesWithSubs = categories.map(cat => ({
      ...cat.toObject(),
      subCategories: subCategories.filter(sub => sub.categoryId.toString() === cat._id.toString())
    }));

    success(res, { categories: categoriesWithSubs });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, isActive } = req.body;
    const category = await ServiceCategory.create({ name, slug, isActive });
    success(res, { category }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await ServiceCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return error(res, 'Category not found', 404);
    success(res, { category });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await ServiceCategory.findByIdAndDelete(req.params.id);
    if (!category) return error(res, 'Category not found', 404);
    // Cascade delete subcategories
    await ServiceSubCategory.deleteMany({ categoryId: category._id });
    success(res, { message: 'Category and its subcategories deleted successfully' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const createSubCategory = async (req, res) => {
  try {
    const { name, slug, isActive } = req.body;
    const subCategory = await ServiceSubCategory.create({
      categoryId: req.params.categoryId,
      name,
      slug,
      isActive
    });
    success(res, { subCategory }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const updateSubCategory = async (req, res) => {
  try {
    const subCategory = await ServiceSubCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!subCategory) return error(res, 'Subcategory not found', 404);
    success(res, { subCategory });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await ServiceSubCategory.findByIdAndDelete(req.params.id);
    if (!subCategory) return error(res, 'Subcategory not found', 404);
    success(res, { message: 'Subcategory deleted successfully' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// ==================== CITIES & AREA NEIGHBORHOODS ====================

export const getCities = async (req, res) => {
  try {
    const cities = await City.find().sort({ name: 1 });
    const areas = await Area.find().sort({ name: 1 });

    const citiesWithAreas = cities.map(city => ({
      ...city.toObject(),
      areas: areas.filter(a => a.cityId.toString() === city._id.toString())
    }));

    success(res, { cities: citiesWithAreas });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const createCity = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const city = await City.create({ name, isActive });
    success(res, { city }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const updateCity = async (req, res) => {
  try {
    const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!city) return error(res, 'City not found', 404);
    success(res, { city });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const deleteCity = async (req, res) => {
  try {
    const city = await City.findByIdAndDelete(req.params.id);
    if (!city) return error(res, 'City not found', 404);
    // Cascade delete areas
    await Area.deleteMany({ cityId: city._id });
    success(res, { message: 'City and its areas deleted successfully' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const createArea = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const area = await Area.create({
      cityId: req.params.cityId,
      name,
      isActive
    });
    success(res, { area }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const updateArea = async (req, res) => {
  try {
    const area = await Area.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!area) return error(res, 'Area not found', 404);
    success(res, { area });
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const deleteArea = async (req, res) => {
  try {
    const area = await Area.findByIdAndDelete(req.params.id);
    if (!area) return error(res, 'Area not found', 404);
    success(res, { message: 'Area deleted successfully' });
  } catch (err) {
    error(res, err.message, 500);
  }
};
