import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Load models
import User from '../models/User.js';
import Request from '../models/Request.js';
import Quote from '../models/Quote.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Vehicle from '../models/Vehicle.js';
import { loadSettings } from '../utils/settings.js';

import { createPaymentIntent, bypassPayment } from '../controllers/payment.controller.js';

async function testPaymentSystem() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/garro';
    console.log('Connecting to database:', mongoUri);
    await mongoose.connect(mongoUri);
    await loadSettings();

    // 1. Create a dummy customer user
    const customer = await User.create({
      name: 'Test Customer User',
      email: 'temp_customer_' + Date.now() + '@test.com',
      phone: '+971500000000',
      role: 'customer',
      status: 'active',
      password: 'TestPassword123'
    });
    console.log('Created test customer:', customer._id);

    // 2. Create a test vehicle
    const vehicle = await Vehicle.create({
      userId: customer._id,
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      registrationNumber: 'DXB-T-12345'
    });
    console.log('Created test vehicle:', vehicle._id);

    // 3. Create a dummy request
    const request = await Request.create({
      userId: customer._id,
      vehicleId: vehicle._id,
      serviceType: 'minor_service',
      description: 'Test vehicle service request',
      status: 'quote_approved',
      location: { lat: 25.0, lng: 55.0 }
    });
    console.log('Created test request:', request._id);

    // 4. Create a dummy quote
    const quote = new Quote({
      requestId: request._id,
      partsCost: 300,
      laborCost: 150,
      status: 'approved'
    });
    await quote.save();
    console.log('Created test quote:', quote._id, 'Total:', quote.customerTotal);

    // Mock Response Helper
    const makeMockRes = () => {
      let resolveFn;
      const promise = new Promise((resolve) => { resolveFn = resolve; });
      const res = {
        statusCode: 200,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) {
          resolveFn({ status: this.statusCode, data });
          return this;
        },
        send: function(data) {
          resolveFn({ status: this.statusCode, data });
          return this;
        }
      };
      return { res, promise };
    };

    // --- TEST 1: createPaymentIntent ---
    console.log('\n--- Running Test 1: createPaymentIntent ---');
    const req1 = {
      body: { quoteId: quote._id.toString() },
      user: { id: customer._id.toString(), role: 'customer' }
    };
    const { res: res1, promise: promise1 } = makeMockRes();
    await createPaymentIntent(req1, res1);
    const result1 = await promise1;
    console.log('Result Status:', result1.status);
    console.log('Result Data:', JSON.stringify(result1.data, null, 2));

    if (result1.status !== 200 || !result1.data.success) {
      throw new Error('createPaymentIntent failed!');
    }
    console.log('Refactored createPaymentIntent endpoint runs successfully.');

    // --- TEST 2: bypassPayment as Admin ---
    console.log('\n--- Running Test 2: bypassPayment (Admin) ---');
    const req2 = {
      body: { quoteId: quote._id.toString() },
      user: { id: customer._id.toString(), role: 'admin' }, // admin role
      app: { get: () => null } // mocks Socket.IO io
    };
    const { res: res2, promise: promise2 } = makeMockRes();
    await bypassPayment(req2, res2);
    const result2 = await promise2;
    console.log('Result Status:', result2.status);
    console.log('Result Data:', JSON.stringify(result2.data, null, 2));

    if (result2.status !== 200 || !result2.data.success) {
      throw new Error('bypassPayment as Admin failed!');
    }
    console.log('Refactored bypassPayment endpoint runs successfully.');

    // Verify Invoice was created in DB
    const inv = await Invoice.findOne({ quoteId: quote._id });
    if (!inv || inv.status !== 'paid') {
      throw new Error('Invoice was not successfully created or marked paid!');
    }
    console.log('✅ Invoice successfully created and marked paid in DB:', inv.invoiceNumber);

    // --- CLEANUP ---
    console.log('\nCleaning up database documents...');
    await Invoice.findByIdAndDelete(inv._id);
    await Quote.findByIdAndDelete(quote._id);
    await Request.findByIdAndDelete(request._id);
    await Vehicle.findByIdAndDelete(vehicle._id);
    await User.findByIdAndDelete(customer._id);
    await Payment.deleteMany({ stripePaymentIntentId: { $regex: /^bypass_/ } });
    console.log('Cleanup complete.');

    console.log('\n🎉 ALL PAYMENT SYSTEM INTEGRATION TESTS PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

testPaymentSystem();
