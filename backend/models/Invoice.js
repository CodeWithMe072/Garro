import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber:  { type: String, unique: true }, // GAR-2026-00001

  // References
  jobId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: false },
  quoteId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  garageId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Garage', required: false },

  // Line items — printed on invoice (customer-facing)
  lineItems: [{
    description: { type: String },
    qty:         { type: Number },
    unitPrice:   { type: Number },
    total:       { type: Number }
  }],

  // Amounts
  partsCost:   { type: Number, required: true },
  laborCost:   { type: Number, required: true },
  subtotal:    { type: Number, required: true }, // partsCost + laborCost
  vatPercent:  { type: Number, default: 5 },
  vatAmount:   { type: Number, required: true }, // from quote.vat
  totalAmount: { type: Number, required: true }, // from quote.customerTotal

  // Internal only — NOT printed on customer invoice
  serviceFeePercent:  { type: Number, default: 10 },
  serviceFeeAmount:   { type: Number }, // from quote.serviceFee
  garagePayoutAmount: { type: Number }, // subtotal * 0.90

  // Payment details
  status:                { type: String, enum: ['pending', 'paid', 'overdue', 'refunded'], default: 'pending' },
  paidAt:                { type: Date },
  paymentMethod:         { type: String },
  stripePaymentIntentId: { type: String },

  // PDF
  pdfUrl:  { type: String }, // Cloudflare R2 URL
  dueDate: { type: Date }
}, { timestamps: true });

// Auto-generate invoice number before first save
invoiceSchema.pre('save', async function () {
  if (!this.invoiceNumber) {
    const year  = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.invoiceNumber = `GAR-${year}-${String(count + 1).padStart(5, '0')}`;
  }
});

export default mongoose.model('Invoice', invoiceSchema);
