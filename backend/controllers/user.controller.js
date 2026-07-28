import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Request from '../models/Request.js';
import Quote from '../models/Quote.js';
import Job from '../models/Job.js';
import Invoice from '../models/Invoice.js';
import Review from '../models/Review.js';
import { success, error } from '../utils/response.js';

// GET /api/users/me/export
export const exportUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return error(res, 'User not found', 404);

    const vehicles = await Vehicle.find({ userId: req.user.id });
    const requests = await Request.find({ userId: req.user.id });
    const quotes = await Quote.find({ requestId: { $in: requests.map(r => r._id) } });
    const jobs = await Job.find({ quoteId: { $in: quotes.map(q => q._id) } });
    const invoices = await Invoice.find({ customerId: req.user.id });
    const reviews = await Review.find({ userId: req.user.id });

    const exportData = {
      exportedAt: new Date(),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      },
      vehicles: vehicles.map(v => ({
        make: v.make,
        model: v.model,
        year: v.year,
        engineType: v.engineType,
        registrationNumber: v.registrationNumber,
        VIN: v.VIN,
        createdAt: v.createdAt
      })),
      requests: requests.map(r => ({
        serviceType: r.serviceType,
        subCategory: r.subCategory,
        description: r.description,
        status: r.status,
        urgency: r.urgency,
        createdAt: r.createdAt
      })),
      quotes: quotes.map(q => ({
        partsCost: q.partsCost,
        laborCost: q.laborCost,
        subtotal: q.subtotal,
        serviceFee: q.serviceFee,
        vat: q.vat,
        customerTotal: q.customerTotal,
        status: q.status,
        createdAt: q.createdAt
      })),
      jobs: jobs.map(j => ({
        status: j.status,
        startDate: j.startDate,
        actualEndDate: j.actualEndDate,
        createdAt: j.createdAt
      })),
      invoices: invoices.map(i => ({
        invoiceNumber: i.invoiceNumber,
        partsCost: i.partsCost,
        laborCost: i.laborCost,
        subtotal: i.subtotal,
        vatAmount: i.vatAmount,
        totalAmount: i.totalAmount,
        status: i.status,
        paymentMethod: i.paymentMethod,
        paidAt: i.paidAt,
        createdAt: i.createdAt
      })),
      reviews: reviews.map(rev => ({
        rating: rev.rating,
        comment: rev.comment,
        createdAt: rev.createdAt
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=garro_data_export_${user._id}.json`);
    return res.send(JSON.stringify(exportData, null, 2));
  } catch (err) {
    error(res, err.message, 500);
  }
};

// DELETE /api/users/me
export const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return error(res, 'User not found', 404);

    // GDPR Soft Delete: anonymize personal data
    user.status = 'deleted';
    user.name = 'Deleted User ' + user._id.toString().slice(-6);
    user.email = `deleted_${user._id}@deleted.garro.ae`;
    user.phone = '+971000000000';
    user.password = 'DELETED';
    await user.save();

    // Soft delete associated Vehicles
    await Vehicle.updateMany({ userId: req.user.id }, { isActive: false });

    // Cancel pending requests that haven't been completed yet
    await Request.updateMany(
      { userId: req.user.id, status: { $in: ['pending_payment', 'new', 'assigned', 'quote_pending', 'quote_sent', 'quote_approved', 'pickup_scheduled'] } },
      { status: 'cancelled' }
    );

    success(res, { message: 'Account successfully deleted and PII anonymized.' });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// GET /api/users/me/favorite-locations
export const getFavoriteLocations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('favoriteLocations');
    if (!user) return error(res, 'User not found', 404);
    success(res, { favoriteLocations: user.favoriteLocations || [] });
  } catch (err) {
    error(res, err.message, 500);
  }
};

// POST /api/users/me/favorite-locations
export const addFavoriteLocation = async (req, res) => {
  try {
    const { label, address, lat, lng } = req.body;
    if (!label || !address) return error(res, 'Label and address are required', 400);

    const user = await User.findById(req.user.id);
    if (!user) return error(res, 'User not found', 404);

    user.favoriteLocations.push({ label, address, lat, lng });
    await user.save();

    success(res, { favoriteLocations: user.favoriteLocations }, 201);
  } catch (err) {
    error(res, err.message, 500);
  }
};
