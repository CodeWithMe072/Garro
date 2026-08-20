import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import Request from '../models/Request.js';
import Quote from '../models/Quote.js';
import PendingQuote from '../models/PendingQuote.js';
import Job from '../models/Job.js';
import Invoice from '../models/Invoice.js';

const clearData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/garro';
    console.log(`Connecting to MongoDB: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing Quotes and Requests collections...');

    const deletedRequests = await Request.deleteMany({});
    console.log(`Deleted ${deletedRequests.deletedCount} Request document(s).`);

    const deletedQuotes = await Quote.deleteMany({});
    console.log(`Deleted ${deletedQuotes.deletedCount} Quote document(s).`);

    const deletedPendingQuotes = await PendingQuote.deleteMany({});
    console.log(`Deleted ${deletedPendingQuotes.deletedCount} PendingQuote document(s).`);

    const deletedJobs = await Job.deleteMany({});
    console.log(`Deleted ${deletedJobs.deletedCount} Job document(s).`);

    const deletedInvoices = await Invoice.deleteMany({});
    console.log(`Deleted ${deletedInvoices.deletedCount} Invoice document(s).`);

    console.log('Successfully cleared all requests, quotes, pending quotes, jobs, and invoices from database.');
    process.exit(0);
  } catch (err) {
    console.error('Error clearing data:', err);
    process.exit(1);
  }
};

clearData();
