import mongoose from 'mongoose';
import Invoice from './models/Invoice.js';
import Quote from './models/Quote.js';
import Request from './models/Request.js';

const mongoURI = 'mongodb://127.0.0.1:27017/garro';

async function check() {
  await mongoose.connect(mongoURI);
  
  const invoices = await Invoice.find().populate('quoteId');
  const quotes = await Quote.find({ status: 'paid' });
  const requests = await Request.find({ status: 'quote_approved' });
  
  console.log('Invoices count:', invoices.length);
  invoices.forEach(inv => {
    console.log(`Invoice #${inv.invoiceNumber}: Status=${inv.status}, QuoteID=${inv.quoteId?._id}, Total=${inv.totalAmount}, PDF=${inv.pdfUrl}`);
  });

  console.log('Paid Quotes count:', quotes.length);
  quotes.forEach(q => {
    console.log(`Paid Quote ID: ${q._id}, Total: ${q.customerTotal}`);
  });

  console.log('Quote Approved Requests count:', requests.length);
  requests.forEach(r => {
    console.log(`Request ID: ${r._id}, Service: ${r.serviceType}`);
  });
  
  process.exit(0);
}

check().catch(console.error);
