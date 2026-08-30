import ServicePricing from '../models/ServicePricing.js';
import { success, error } from '../utils/response.js';

// Default seed data — used to seed the collection on first GET if empty
const DEFAULT_PRICES = [
  { serviceType: 'minor_service', label: 'Minor Service',                  partsCost: 0,   laborCost: 299, durationHours: 2 },
  { serviceType: 'major_service', label: 'Major Service',                  partsCost: 0,   laborCost: 599, durationHours: 4 },
  { serviceType: 'brake_repair',  label: 'Brake Pad Replacement',          partsCost: 150, laborCost: 249, durationHours: 2 },
  { serviceType: 'battery',       label: 'Battery Diagnostics & Change',   partsCost: 300, laborCost: 199, durationHours: 1 },
  { serviceType: 'ac_repair',     label: 'AC Gas Topup & Repair',          partsCost: 50,  laborCost: 199, durationHours: 1 },
  { serviceType: 'electrical',    label: 'Electrical Diagnostics & Repair',partsCost: 0,   laborCost: 249, durationHours: 3 },
  { serviceType: 'diagnostics',   label: 'Engine Diagnostics',             partsCost: 0,   laborCost: 99,  durationHours: 1 },
  { serviceType: 'roadside_assistance', label: 'Roadside Assistance',      partsCost: 0,   laborCost: 150, durationHours: 1 },
  { serviceType: 'emergency_pickup',    label: 'Emergency Recovery Pickup',partsCost: 0,   laborCost: 150, durationHours: 1 },
  { serviceType: 'other',         label: 'General Mechanical Repair',      partsCost: 0,   laborCost: 199, durationHours: 3 },
];

/**
 * GET /api/admin/service-pricing
 * Returns all service pricing entries. Seeds defaults on first call if collection is empty.
 */
export const getServicePricing = async (req, res) => {
  try {
    let pricing = await ServicePricing.find().sort({ serviceType: 1 });

    // Seed defaults on first use
    if (pricing.length === 0) {
      pricing = await ServicePricing.insertMany(DEFAULT_PRICES);
    }

    success(res, { pricing });
  } catch (err) {
    error(res, err.message, 500);
  }
};

/**
 * POST /api/admin/service-pricing
 * Create a new service pricing entry.
 */
export const createServicePricing = async (req, res) => {
  try {
    const { label, partsCost, laborCost, durationHours, serviceType } = req.body;

    if (!label || laborCost === undefined) {
      return error(res, 'Service label and laborCost are required', 400);
    }

    const key = (serviceType || label)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const existing = await ServicePricing.findOne({ serviceType: key });
    if (existing) {
      return error(res, `Service type '${key}' already exists`, 400);
    }

    const created = await ServicePricing.create({
      serviceType: key,
      label: label.trim(),
      partsCost: Number(partsCost) || 0,
      laborCost: Number(laborCost) || 0,
      durationHours: Number(durationHours) || 2
    });

    success(res, { pricing: created, message: `New service '${label}' created successfully` }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};

/**
 * DELETE /api/admin/service-pricing/:serviceType
 * Delete a service pricing entry.
 */
export const deleteServicePricing = async (req, res) => {
  try {
    const { serviceType } = req.params;
    const deleted = await ServicePricing.findOneAndDelete({ serviceType });
    if (!deleted) {
      return error(res, 'Service pricing entry not found', 404);
    }
    success(res, { message: `Service '${deleted.label}' deleted successfully` });
  } catch (err) {
    error(res, err.message, 500);
  }
};

/**
 * PUT /api/admin/service-pricing/:serviceType
 * Upsert a pricing entry for a given service type.
 */
export const updateServicePricing = async (req, res) => {
  try {
    const { serviceType } = req.params;
    const { partsCost, laborCost, durationHours, label } = req.body;

    if (partsCost === undefined || laborCost === undefined) {
      return error(res, 'partsCost and laborCost are required', 400);
    }

    const updated = await ServicePricing.findOneAndUpdate(
      { serviceType },
      { partsCost: Number(partsCost), laborCost: Number(laborCost), durationHours: Number(durationHours) || 2, label: label || serviceType },
      { upsert: true, new: true, runValidators: true }
    );

    success(res, { pricing: updated, message: `Pricing for ${serviceType} updated` });
  } catch (err) {
    error(res, err.message, 500);
  }
};

/**
 * Helper — get a single price for a serviceType (used by request.controller.js).
 * Falls back to hardcoded defaults if DB not seeded yet (graceful degradation).
 */
export const getPriceForServiceType = async (serviceType) => {
  try {
    const entry = await ServicePricing.findOne({ serviceType });
    if (entry) return { partsCost: entry.partsCost, laborCost: entry.laborCost, total: entry.partsCost + entry.laborCost };
  } catch {
    // Fall through to hardcoded defaults
  }
  const fallback = {
    minor_service: 299, major_service: 599, brake_repair: 399,
    battery: 499, ac_repair: 249, electrical: 249, diagnostics: 99,
    roadside_assistance: 150, other: 199
  };
  const total = fallback[serviceType] || 199;
  return { partsCost: 0, laborCost: total, total };
};
