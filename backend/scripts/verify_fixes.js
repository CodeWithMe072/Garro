import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import Quote from '../models/Quote.js';
import Request from '../models/Request.js';
import Garage from '../models/Garage.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import { getDelegateView, respondScopeRevisionAsDelegate, respondScopeRevision, revokeDelegate, assignDelegate } from '../controllers/job.controller.js';
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

async function runVerification() {
  console.log('=== MULTI-REVISION & REJECTION MATHEMATICAL VERIFICATION ===\n');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB local instance.\n');

  // Setup Test Data
  const testUser = await User.create({ name: 'Verification Test User', email: `test_${Date.now()}@example.com`, password: 'Password123!', phone: '+971500000000', role: 'customer' });
  const testVehicle = await Vehicle.create({ userId: testUser._id, make: 'Toyota', model: 'Camry', year: 2022, registrationNumber: 'A12345' });
  const testGarage = await Garage.create({ name: 'Verification Test Garage', email: `garage_${Date.now()}@example.com`, phone: '+97140000000', address: 'Dubai Al Quoz' });
  const testReq = await Request.create({ userId: testUser._id, vehicleId: testVehicle._id, garageId: testGarage._id, serviceType: 'major_service', description: 'Engine oil and filter change required' });
  
  // Create base quote: subtotal 1000, customer total 1155, margin = 0.1342 (13.42%)
  const testQuote = await Quote.create({ requestId: testReq._id, garageId: testGarage._id, partsCost: 800, laborCost: 200, subtotal: 1000, serviceFee: 100, vat: 55, customerTotal: 1155, status: 'sent' });

  // 1. Approve Initial Quote
  const approveQuoteReq = { params: { id: testQuote._id.toString() }, user: { id: testUser._id.toString() } };
  const approveQuoteRes = mockRes();
  await approveQuote(approveQuoteReq, approveQuoteRes);
  const createdJob = approveQuoteRes.data.job;

  console.log('--- BASE JOB CREATED ---');
  console.log(`Base Subtotal: ${createdJob.revisedSubtotal} | Base Customer Total: ${createdJob.revisedCustomerTotal}`);
  console.log(`Initial quotedMargin: ${createdJob.quotedMargin} | Initial actualMargin: ${createdJob.actualMargin}\n`);

  // 2. Add Revision A (+AED 400) and Revision B (+AED 200) and Revision C (+AED 500)
  createdJob.scopeRevisions.push({
    additionalPartsCost: 300, additionalLaborCost: 100, additionalAmount: 400,
    justification: 'Revision A - Transmission fluid leak', requiresApproval: true, status: 'pending'
  });
  createdJob.scopeRevisions.push({
    additionalPartsCost: 150, additionalLaborCost: 50, additionalAmount: 200,
    justification: 'Revision B - Brake pad replacement', requiresApproval: true, status: 'pending'
  });
  createdJob.scopeRevisions.push({
    additionalPartsCost: 400, additionalLaborCost: 100, additionalAmount: 500,
    justification: 'Revision C - AC Compressor repair', requiresApproval: true, status: 'pending'
  });
  createdJob.isScopeApprovalPending = true;
  await createdJob.save();

  const revA_Id = createdJob.scopeRevisions[0]._id.toString();
  const revB_Id = createdJob.scopeRevisions[1]._id.toString();
  const revC_Id = createdJob.scopeRevisions[2]._id.toString();

  // Assign Delegate for testing delegate endpoints
  const assignReq = { params: { id: createdJob._id.toString() }, body: { name: 'Sarah Delegate', email: 'sarah@garro.ae', phone: '+971550009999' } };
  await assignDelegate(assignReq, mockRes());
  const updatedJob = await Job.findById(createdJob._id);
  const accessCode = updatedJob.delegate.accessCode;

  // 3. Test APPROVING REVISION A (+AED 400)
  console.log('--- TEST 1: Approving Revision A (+AED 400) ---');
  const revAReq = { params: { accessCode, revisionId: revA_Id }, body: { action: 'approved' } };
  await respondScopeRevisionAsDelegate(revAReq, mockRes());
  let jobAfterA = await Job.findById(createdJob._id);
  console.log(`After Rev A -> Subtotal: ${jobAfterA.revisedSubtotal} (Expect 1400) | Customer Total: ${jobAfterA.revisedCustomerTotal} (Expect 1555)`);
  console.log(`After Rev A -> actualMargin: ${jobAfterA.actualMargin} (Expect 0.0997)`);

  if (jobAfterA.revisedSubtotal !== 1400 || jobAfterA.revisedCustomerTotal !== 1555 || jobAfterA.actualMargin !== 0.0997) {
    throw new Error('ASSERTION FAILED on Revision A approval');
  }

  // 4. Test APPROVING REVISION B (+AED 200 ACCUMULATION CHECK)
  console.log('\n--- TEST 2: Approving Revision B (+AED 200) (Accumulation Check) ---');
  const revBReq = { params: { accessCode, revisionId: revB_Id }, body: { action: 'approved' } };
  await respondScopeRevisionAsDelegate(revBReq, mockRes());
  let jobAfterB = await Job.findById(createdJob._id);
  console.log(`After Rev B -> Subtotal: ${jobAfterB.revisedSubtotal} (Expect 1600) | Customer Total: ${jobAfterB.revisedCustomerTotal} (Expect 1755)`);
  console.log(`After Rev B -> actualMargin: ${jobAfterB.actualMargin} (Expect 0.0883)`);

  // Math Check: (1755 - 1600) / 1755 = 155 / 1755 = 0.088319 -> 0.0883
  if (jobAfterB.revisedSubtotal !== 1600 || jobAfterB.revisedCustomerTotal !== 1755 || jobAfterB.actualMargin !== 0.0883) {
    throw new Error(`ASSERTION FAILED on Revision B accumulation. Got subtotal=${jobAfterB.revisedSubtotal}, customerTotal=${jobAfterB.revisedCustomerTotal}, margin=${jobAfterB.actualMargin}`);
  }
  console.log('✅ Revision B accumulated both Rev A (+400) and Rev B (+200) correctly!');

  // 5. Test REJECTING REVISION C (+AED 500 REJECTION CHECK)
  console.log('\n--- TEST 3: Rejecting Revision C (+AED 500) (Rejection Integrity Check) ---');
  const revCReq = { params: { accessCode, revisionId: revC_Id }, body: { action: 'rejected' } };
  await respondScopeRevisionAsDelegate(revCReq, mockRes());
  let jobAfterC = await Job.findById(createdJob._id);
  console.log(`After Rev C Rejection -> Subtotal: ${jobAfterC.revisedSubtotal} (Must remain 1600)`);
  console.log(`After Rev C Rejection -> Customer Total: ${jobAfterC.revisedCustomerTotal} (Must remain 1755)`);
  console.log(`After Rev C Rejection -> actualMargin: ${jobAfterC.actualMargin} (Must remain 0.0883)`);
  console.log(`Rev C Status: ${jobAfterC.scopeRevisions[2].status} (Expect 'rejected')`);

  if (jobAfterC.revisedSubtotal !== 1600 || jobAfterC.revisedCustomerTotal !== 1755 || jobAfterC.actualMargin !== 0.0883 || jobAfterC.scopeRevisions[2].status !== 'rejected') {
    throw new Error('ASSERTION FAILED on Revision C rejection integrity');
  }
  console.log('✅ Rejected Revision C left totals and actualMargin completely untouched!');

  // Cleanup Test Artifacts
  await Job.findByIdAndDelete(createdJob._id);
  await Quote.findByIdAndDelete(testQuote._id);
  await Request.findByIdAndDelete(testReq._id);
  await Vehicle.findByIdAndDelete(testVehicle._id);
  await Garage.findByIdAndDelete(testGarage._id);
  await User.findByIdAndDelete(testUser._id);

  console.log('\n=== ALL MULTI-REVISION & REJECTION ASSERTIONS PASSED WITH 100% MATHEMATICAL PRECISION ===');
  await mongoose.disconnect();
}

runVerification().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});
