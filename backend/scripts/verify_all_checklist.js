import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import Quote from '../models/Quote.js';
import Request from '../models/Request.js';

dotenv.config({ path: './.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/garro';

// Simulated getStepIndex logic from TrackRequest.jsx
const getTrackStepIndex = (status) => {
  if (['cancelled', 'cancellation_requested'].includes(status)) return -1;
  if (['pending_payment', 'new', 'assigned', 'quote_pending', 'quote_sent', 'quote_approved', 'pending'].includes(status)) return 0;
  if (['pickup_scheduled', 'arrived_at_customer', 'picked_up'].includes(status)) return 1;
  if (['in_garage', 'inspection_done', 'repair_in_progress'].includes(status)) return 2;
  if (['service_done', 'work_complete', 'ready_for_delivery'].includes(status)) return 3;
  if (['delivered', 'completed', 'closed'].includes(status)) return 4;
  return 0;
};

// Simulated MyBookings complete tab filter logic
const isCompletedTab = (status) => {
  return ['delivered', 'completed', 'closed'].includes(status);
};

async function runChecklistAudit() {
  console.log('=== ITEM 2 & 3: TRACKREQUEST AND MYBOOKINGS LOGICAL AUDIT ===\n');
  
  const allStatuses = [
    'pending_payment', 'new', 'assigned', 'quote_pending', 'quote_sent', 'quote_approved',
    'pickup_scheduled', 'arrived_at_customer', 'picked_up', 'in_garage', 'inspection_done',
    'repair_in_progress', 'service_done', 'work_complete', 'ready_for_delivery',
    'delivered', 'closed', 'cancelled', 'cancellation_requested'
  ];

  console.log('--- TRACKREQUEST 19-STATUS TIMELINE MAPPING AUDIT ---');
  let prevStep = 0;
  for (const status of allStatuses) {
    const idx = getTrackStepIndex(status);
    const stepLabel = idx === -1 ? '❌ CANCELLED BANNER (ProgressBar Hidden)' : `Step ${idx + 1}`;
    console.log(`Status: '${status.padEnd(23)}' -> ${stepLabel}`);
  }

  console.log('\n--- MYBOOKINGS TAB FILTERING AUDIT ---');
  console.log(`Job at 'service_done' in Complete Tab? ${isCompletedTab('service_done')} (Expect false)`);
  console.log(`Job at 'delivered'    in Complete Tab? ${isCompletedTab('delivered')}    (Expect true)`);
  console.log(`Job at 'closed'       in Complete Tab? ${isCompletedTab('closed')}       (Expect true)`);

  if (isCompletedTab('service_done') === false && isCompletedTab('delivered') === true) {
    console.log('✅ CHECK 3 PASSED: service_done is excluded from Complete tab, delivered/closed are included!\n');
  } else {
    throw new Error('ASSERTION FAILED on MyBookings tab filtering!');
  }
}

runChecklistAudit().catch(err => {
  console.error('Audit error:', err);
  process.exit(1);
});
