import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import Garage from '../models/Garage.js';
import Helper from '../models/Helper.js';
import HelperBookingSlot from '../models/HelperBookingSlot.js';
import HelperTracking from '../models/HelperTracking.js';

const testUserEmails = [
  'admin@garro.ae',
  'customer@test.com',
  'ahmed@garro.ae',
  'omar@garro.ae',
  'john@garro.ae',
  'jane@garro.ae',
  'alex@garro.ae',
  'michael@garro.ae',
  'alquoz@test.com',
  'deira@test.com',
  'marina@test.com',
  'barsha@test.com',
  'downtown@test.com',
  'mirdif@test.com'
];

const testGarageEmails = [
  'alquoz@test.com',
  'deira@test.com',
  'marina@test.com',
  'barsha@test.com',
  'downtown@test.com',
  'mirdif@test.com'
];

async function removeTestAccounts() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('MONGO_URI is not defined in the environment.');
      process.exit(1);
    }

    console.log('Connecting to database...');
    await mongoose.connect(mongoUri);
    console.log('Database connected.');

    // 1. Find User IDs corresponding to test emails
    const users = await User.find({ email: { $in: testUserEmails } });
    const userIds = users.map(u => u._id);
    console.log(`Found ${users.length} test user accounts to delete.`);

    // 2. Find Helper IDs linked to those user IDs
    const helpers = await Helper.find({ userId: { $in: userIds } });
    const helperIds = helpers.map(h => h._id);
    console.log(`Found ${helpers.length} test helper profiles linked to those users.`);

    // 3. Delete Helper booking slots and tracking data
    const trackingResult = await HelperTracking.deleteMany({ helperId: { $in: helperIds } });
    console.log(`Deleted ${trackingResult.deletedCount} helper tracking records.`);

    const slotResult = await HelperBookingSlot.deleteMany({ helperId: { $in: helperIds } });
    console.log(`Deleted ${slotResult.deletedCount} helper booking slots.`);

    // 4. Delete Helper profiles
    const helperResult = await Helper.deleteMany({ userId: { $in: userIds } });
    console.log(`Deleted ${helperResult.deletedCount} helper documents.`);

    // 5. Delete User documents
    const userResult = await User.deleteMany({ email: { $in: testUserEmails } });
    console.log(`Deleted ${userResult.deletedCount} user documents.`);

    // 6. Delete Garage profiles
    const garageResult = await Garage.deleteMany({ email: { $in: testGarageEmails } });
    console.log(`Deleted ${garageResult.deletedCount} garage documents.`);

    console.log('Test accounts cleanup completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error removing test accounts:', err.message);
    process.exit(1);
  }
}

removeTestAccounts();
