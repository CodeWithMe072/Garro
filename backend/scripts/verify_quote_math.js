import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Quote from '../models/Quote.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Request from '../models/Request.js';

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/garro';

async function verifyQuoteMath() {
  console.log('=== EMPIRICAL PROOF OF QUOTE BUILDER MATH CALCULATION ===\n');
  await mongoose.connect(MONGO_URI);

  const testUser = await User.create({ name: 'Quote Math Customer', email: `math_${Date.now()}@example.com`, password: 'Password123!', phone: '+971500000000', role: 'customer' });
  const testVehicle = await Vehicle.create({ userId: testUser._id, make: 'Toyota', model: 'Camry', year: 2022, registrationNumber: 'DXB-11111' });
  const testReq = await Request.create({ userId: testUser._id, vehicleId: testVehicle._id, serviceType: 'minor_service', description: 'Math verification' });

  // Baseline Quote: Without servicePrice and machineCostPerService
  const baseQuote = await Quote.create({
    requestId: testReq._id,
    partsCost: 800,
    laborCost: 200,
    servicePrice: 0,
    machineCostPerService: 0
  });

  // Updated Quote: With servicePrice = 50 and machineCostPerService = 25
  const updatedQuote = await Quote.create({
    requestId: testReq._id,
    partsCost: 800,
    laborCost: 200,
    servicePrice: 50,
    machineCostPerService: 25
  });

  console.log('--- BASELINE QUOTE (partsCost: 800, laborCost: 200, servicePrice: 0, machineCostPerService: 0) ---');
  console.log(`Subtotal:      AED ${baseQuote.subtotal} (800 + 200)`);
  console.log(`Platform Fee:  AED ${baseQuote.serviceFee} (10% of 1000)`);
  console.log(`VAT:           AED ${baseQuote.vat} (5% of 1100)`);
  console.log(`CustomerTotal: AED ${baseQuote.customerTotal} (1000 + 100 + 55)`);
  console.log(`Margin:        ${(baseQuote.margin * 100).toFixed(2)}%\n`);

  console.log('--- UPDATED QUOTE (partsCost: 800, laborCost: 200, servicePrice: 50, machineCostPerService: 25) ---');
  console.log(`Subtotal:      AED ${updatedQuote.subtotal} (800 + 200 + 50 + 25 = 1075)`);
  console.log(`Platform Fee:  AED ${updatedQuote.serviceFee} (10% of 1075 = 107.50)`);
  console.log(`VAT:           AED ${updatedQuote.vat} (5% of 1182.50 = 59.13)`);
  console.log(`CustomerTotal: AED ${updatedQuote.customerTotal} (1075 + 107.50 + 59.13 = 1241.63)`);
  console.log(`Margin:        ${(updatedQuote.margin * 100).toFixed(2)}%\n`);

  const deltaSubtotal = updatedQuote.subtotal - baseQuote.subtotal;
  const deltaCustomerTotal = parseFloat((updatedQuote.customerTotal - baseQuote.customerTotal).toFixed(2));

  console.log(`Subtotal Delta:      +AED ${deltaSubtotal} (Expect 75)`);
  console.log(`CustomerTotal Delta: +AED ${deltaCustomerTotal} (Expect 86.63)`);

  if (deltaSubtotal !== 75 || deltaCustomerTotal !== 86.63) {
    throw new Error('ASSERTION FAILED: Quote math calculation delta is invalid!');
  }

  console.log('✅ EMPIRICAL PROOF PASSED: servicePrice and machineCostPerService directly feed into subtotal, platform fee, VAT, and customerTotal calculations!\n');

  // Cleanup
  await Quote.findByIdAndDelete(baseQuote._id);
  await Quote.findByIdAndDelete(updatedQuote._id);
  await Request.findByIdAndDelete(testReq._id);
  await Vehicle.findByIdAndDelete(testVehicle._id);
  await User.findByIdAndDelete(testUser._id);

  await mongoose.disconnect();
}

verifyQuoteMath().catch(err => {
  console.error(err);
  process.exit(1);
});
