import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import Quote from '../models/Quote.js';
import Request from '../models/Request.js';
import Garage from '../models/Garage.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import VCR from '../models/VehicleConditionReport.js';
import { getDelegateView, respondScopeRevisionAsDelegate, revokeDelegate, assignDelegate, updateStatus } from '../controllers/job.controller.js';
import { approveQuote } from '../controllers/quote.controller.js';

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/garro';

const mockRes = () => {
  const res = {};
  res.statusCode = 200;
  res.data = null;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.data = data;
    return res;
  };
  return res;
};

async function runPromptVerification() {
  console.log('=== STARTING EMPIRICAL BACKEND & DB VERIFICATION CHECKS ===\n');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB local instance.\n');

  // Setup Test Data
  const testUser = await User.create({ name: 'Verification Customer', email: `cust_${Date.now()}@example.com`, password: 'Password123!', phone: '+971500000000', role: 'customer' });
  const testVehicle = await Vehicle.create({ userId: testUser._id, make: 'Nissan', model: 'Patrol', year: 2023, registrationNumber: 'DXB-99999' });
  const testGarage = await Garage.create({ name: 'Verification Auto Workshop', email: `workshop_${Date.now()}@example.com`, phone: '+97140000000', address: 'Al Quoz Industrial 3' });
  const testReq = await Request.create({ userId: testUser._id, vehicleId: testVehicle._id, garageId: testGarage._id, serviceType: 'major_service', description: 'Comprehensive annual service & inspection' });
  
  // 1. Test Admin Quote Builder Fields Persistence (servicePrice & machineCostPerService)
  console.log('--- CHECK 8: Quote Builder New Fields Persistence to DB ---');
  const testQuote = await Quote.create({
    requestId: testReq._id,
    garageId: testGarage._id,
    partsCost: 800,
    laborCost: 200,
    servicePrice: 50,
    machineCostPerService: 25,
    status: 'sent'
  });

  const savedQuoteDB = await Quote.findById(testQuote._id);
  console.log(`DB Record partsCost: ${savedQuoteDB.partsCost} (Expect 800)`);
  console.log(`DB Record laborCost: ${savedQuoteDB.laborCost} (Expect 200)`);
  console.log(`DB Record servicePrice: ${savedQuoteDB.servicePrice} (Expect 50)`);
  console.log(`DB Record machineCostPerService: ${savedQuoteDB.machineCostPerService} (Expect 25)`);
  
  if (savedQuoteDB.servicePrice !== 50 || savedQuoteDB.machineCostPerService !== 25) {
    throw new Error('ASSERTION FAILED: servicePrice or machineCostPerService did not persist correctly to DB!');
  }
  console.log('✅ CHECK 8 PASSED: servicePrice and machineCostPerService correctly persisted to DB!\n');

  // 2. Test Quote Approval & Job Creation (Request -> Job Transition)
  console.log('--- CHECK 1c: Request -> quote_approved -> Job Creation Transition ---');
  const approveReq = { params: { id: testQuote._id.toString() }, user: { id: testUser._id.toString() } };
  const approveRes = mockRes();
  await approveQuote(approveReq, approveRes);
  
  console.log('Quote Approval Response Status:', approveRes.statusCode);
  const createdJob = approveRes.data.job;
  console.log(`Created Job ID: ${createdJob._id}`);
  console.log(`Initial Job Status: ${createdJob.status} (Expect 'pickup_scheduled')\n`);

  if (createdJob.status !== 'pickup_scheduled') {
    throw new Error(`ASSERTION FAILED: Initial job status is ${createdJob.status}, expected pickup_scheduled`);
  }

  // 3. Test Invalid Transition Rejection (pickup_scheduled -> service_done directly)
  console.log('--- CHECK 1b: Invalid Transition Rejection Check ---');
  const invalidTransReq = {
    params: { id: createdJob._id.toString() },
    body: { status: 'service_done' },
    user: { role: 'admin' }
  };
  const invalidTransRes = mockRes();
  await updateStatus(invalidTransReq, invalidTransRes);

  console.log('Invalid Transition HTTP Status Code:', invalidTransRes.statusCode);
  console.log('Invalid Transition Error Body:', JSON.stringify(invalidTransRes.data, null, 2));

  if (invalidTransRes.statusCode !== 400 || invalidTransRes.data.success !== false) {
    throw new Error('ASSERTION FAILED: Invalid transition (pickup_scheduled -> service_done) was NOT rejected!');
  }
  console.log('✅ CHECK 1b PASSED: Invalid transition correctly rejected with status 400!\n');

  // 4. Test Valid Step-by-Step Transition Sequence through service_done
  console.log('--- CHECK 1a: Valid Step-by-Step Transition Sequence ---');
  const validSequence = [
    'arrived_at_customer',
    'picked_up',
    'in_garage',
    'repair_in_progress',
    'service_done',
    'delivered',
    'closed'
  ];

  // Attach VCR to satisfy in_garage requirement
  const vcr = await VCR.create({ jobId: createdJob._id, helperId: testUser._id, odometer: 45000, fuelLevel: 'full' });
  await Job.findByIdAndUpdate(createdJob._id, { conditionReportId: vcr._id });

  for (const nextStatus of validSequence) {
    const stepReq = {
      params: { id: createdJob._id.toString() },
      body: { status: nextStatus },
      user: { role: 'admin' },
      app: { get: () => null }
    };
    const stepRes = mockRes();
    await updateStatus(stepReq, stepRes);
    
    console.log(`Transitioned to: '${nextStatus}' | HTTP Status: ${stepRes.statusCode} | Success: ${stepRes.data?.success}`);
    if (stepRes.statusCode !== 200 || !stepRes.data?.success) {
      throw new Error(`ASSERTION FAILED on valid transition to ${nextStatus}: ${JSON.stringify(stepRes.data)}`);
    }
  }

  const finalJobDB = await Job.findById(createdJob._id);
  console.log(`\nFinal Job DB Status: ${finalJobDB.status} (Expect 'closed')`);
  if (finalJobDB.status !== 'closed') {
    throw new Error(`ASSERTION FAILED: Final job status is ${finalJobDB.status}, expected 'closed'`);
  }
  console.log('✅ CHECK 1a PASSED: Full status flow walked through service_done -> delivered -> closed with 100% precision!\n');

  // Cleanup Test Records
  await Job.findByIdAndDelete(createdJob._id);
  await Quote.findByIdAndDelete(testQuote._id);
  await Request.findByIdAndDelete(testReq._id);
  await Vehicle.findByIdAndDelete(testVehicle._id);
  await Garage.findByIdAndDelete(testGarage._id);
  await User.findByIdAndDelete(testUser._id);

  console.log('=== EMPIRICAL VERIFICATION COMPLETE WITH ZERO ERRORS ===');
  await mongoose.disconnect();
}

runPromptVerification().catch(err => {
  console.error('Verification Error:', err);
  process.exit(1);
});
