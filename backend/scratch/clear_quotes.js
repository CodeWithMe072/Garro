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

const clearQuotes = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/garro';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    const rRes = await Request.deleteMany({});
    const qRes = await Quote.deleteMany({});
    const pRes = await PendingQuote.deleteMany({});

    console.log(`Successfully cleared database records:`);
    console.log(`- Requests deleted: ${rRes.deletedCount}`);
    console.log(`- Quotes deleted: ${qRes.deletedCount}`);
    console.log(`- PendingQuotes deleted: ${pRes.deletedCount}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error clearing quotes:', err);
    process.exit(1);
  }
};

clearQuotes();
