import Brand from '../models/Brand.js';
import VehicleModel from '../models/VehicleModel.js';
import ServiceCategory from '../models/ServiceCategory.js';
import ServiceSubCategory from '../models/ServiceSubCategory.js';
import City from '../models/City.js';
import Area from '../models/Area.js';
import { success, error } from '../utils/response.js';

// Helper to parse a CSV line, handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// ==================== BRANDS & MODELS BULK ====================

export const exportBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 });
    const models = await VehicleModel.find().sort({ name: 1 });

    let csvContent = 'BrandName,ModelName,IsBrandActive,IsModelActive\n';
    
    if (brands.length === 0) {
      // Just return template
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=brands_template.csv');
      return res.send(csvContent);
    }

    // Generate CSV content
    brands.forEach(brand => {
      const brandModels = models.filter(m => m.brandId.toString() === brand._id.toString());
      if (brandModels.length === 0) {
        csvContent += `"${brand.name}",,${brand.isActive},true\n`;
      } else {
        brandModels.forEach(model => {
          csvContent += `"${brand.name}","${model.name}",${brand.isActive},${model.isActive}\n`;
        });
      }
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=brands_export.csv');
    res.send(csvContent);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const importBrands = async (req, res) => {
  try {
    const { csvText } = req.body;
    if (!csvText) return error(res, 'No CSV content provided', 400);

    const lines = csvText.split(/\r?\n/);
    if (lines.length <= 1) return error(res, 'CSV is empty', 400);

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = parseCSVLine(line);
      if (cols.length < 2) continue;

      const [brandName, modelName, isBrandActiveStr, isModelActiveStr] = cols;
      if (!brandName) continue;

      const isBrandActive = isBrandActiveStr ? isBrandActiveStr.toLowerCase() === 'true' : true;
      const isModelActive = isModelActiveStr ? isModelActiveStr.toLowerCase() === 'true' : true;

      // Find or create Brand
      let brand = await Brand.findOne({ name: brandName });
      if (!brand) {
        brand = await Brand.create({ name: brandName, isActive: isBrandActive });
      } else {
        brand.isActive = isBrandActive;
        await brand.save();
      }

      if (modelName) {
        // Find or create Model
        let model = await VehicleModel.findOne({ brandId: brand._id, name: modelName });
        if (!model) {
          await VehicleModel.create({ brandId: brand._id, name: modelName, isActive: isModelActive });
        } else {
          model.isActive = isModelActive;
          await model.save();
        }
      }
    }

    success(res, { message: 'Brands and Models imported successfully' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// ==================== SERVICE CATALOG BULK ====================

export const exportServices = async (req, res) => {
  try {
    const categories = await ServiceCategory.find().sort({ name: 1 });
    const subCategories = await ServiceSubCategory.find().sort({ name: 1 });

    let csvContent = 'CategoryName,CategorySlug,SubCategoryName,SubCategorySlug,IsCategoryActive,IsSubCategoryActive\n';

    if (categories.length === 0) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=services_template.csv');
      return res.send(csvContent);
    }

    categories.forEach(cat => {
      const catSubs = subCategories.filter(s => s.categoryId.toString() === cat._id.toString());
      if (catSubs.length === 0) {
        csvContent += `"${cat.name}","${cat.slug}",,,${cat.isActive},true\n`;
      } else {
        catSubs.forEach(sub => {
          csvContent += `"${cat.name}","${cat.slug}","${sub.name}","${sub.slug}",${cat.isActive},${sub.isActive}\n`;
        });
      }
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=services_export.csv');
    res.send(csvContent);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const importServices = async (req, res) => {
  try {
    const { csvText } = req.body;
    if (!csvText) return error(res, 'No CSV content provided', 400);

    const lines = csvText.split(/\r?\n/);
    if (lines.length <= 1) return error(res, 'CSV is empty', 400);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = parseCSVLine(line);
      if (cols.length < 2) continue;

      const [catName, catSlug, subName, subSlug, isCatActiveStr, isSubActiveStr] = cols;
      if (!catName || !catSlug) continue;

      const isCatActive = isCatActiveStr ? isCatActiveStr.toLowerCase() === 'true' : true;
      const isSubActive = isSubActiveStr ? isSubActiveStr.toLowerCase() === 'true' : true;

      // Find or create Category
      let cat = await ServiceCategory.findOne({ slug: catSlug });
      if (!cat) {
        cat = await ServiceCategory.create({ name: catName, slug: catSlug, isActive: isCatActive });
      } else {
        cat.name = catName;
        cat.isActive = isCatActive;
        await cat.save();
      }

      if (subName && subSlug) {
        // Find or create Subcategory
        let sub = await ServiceSubCategory.findOne({ slug: subSlug });
        if (!sub) {
          await ServiceSubCategory.create({
            categoryId: cat._id,
            name: subName,
            slug: subSlug,
            isActive: isSubActive
          });
        } else {
          sub.name = subName;
          sub.categoryId = cat._id;
          sub.isActive = isSubActive;
          await sub.save();
        }
      }
    }

    success(res, { message: 'Service Catalog imported successfully' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// ==================== CITIES & AREAS BULK ====================

export const exportLocations = async (req, res) => {
  try {
    const cities = await City.find().sort({ name: 1 });
    const areas = await Area.find().sort({ name: 1 });

    let csvContent = 'CityName,AreaName,IsCityActive,IsAreaActive\n';

    if (cities.length === 0) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=locations_template.csv');
      return res.send(csvContent);
    }

    cities.forEach(city => {
      const cityAreas = areas.filter(a => a.cityId.toString() === city._id.toString());
      if (cityAreas.length === 0) {
        csvContent += `"${city.name}",,${city.isActive},true\n`;
      } else {
        cityAreas.forEach(area => {
          csvContent += `"${city.name}","${area.name}",${city.isActive},${area.isActive}\n`;
        });
      }
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=locations_export.csv');
    res.send(csvContent);
  } catch (err) {
    error(res, err.message, 500);
  }
};

export const importLocations = async (req, res) => {
  try {
    const { csvText } = req.body;
    if (!csvText) return error(res, 'No CSV content provided', 400);

    const lines = csvText.split(/\r?\n/);
    if (lines.length <= 1) return error(res, 'CSV is empty', 400);

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = parseCSVLine(line);
      if (cols.length < 2) continue;

      const [cityName, areaName, isCityActiveStr, isAreaActiveStr] = cols;
      if (!cityName) continue;

      const isCityActive = isCityActiveStr ? isCityActiveStr.toLowerCase() === 'true' : true;
      const isAreaActive = isAreaActiveStr ? isAreaActiveStr.toLowerCase() === 'true' : true;

      // Find or create City
      let city = await City.findOne({ name: cityName });
      if (!city) {
        city = await City.create({ name: cityName, isActive: isCityActive });
      } else {
        city.isActive = isCityActive;
        await city.save();
      }

      if (areaName) {
        // Find or create Area
        let area = await Area.findOne({ cityId: city._id, name: areaName });
        if (!area) {
          await Area.create({ cityId: city._id, name: areaName, isActive: isAreaActive });
        } else {
          area.isActive = isAreaActive;
          await area.save();
        }
      }
    }

    success(res, { message: 'Locations imported successfully' });
  } catch (err) {
    error(res, err.message, 500);
  }
};
