import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  quoteId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', required: true },
  requestId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  garageId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Garage', required: true },
  helperId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Helper', default: null },
  status:            { type: String, default: 'pickup_scheduled' },
  acceptedByGarage:  { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  startDate:         { type: Date },
  estimatedEndDate:  { type: Date },
  actualEndDate:     { type: Date },
  estimatedArrival:  { type: Date },
  photos:            [{ type: String }],
  notes:             { type: String },
  conditionReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleConditionReport', default: null },

  // Change 1 — Scope-creep adjudication
  scopeRevisions: [{
    additionalPartsCost: { type: Number, required: true },
    additionalLaborCost: { type: Number, required: true },
    additionalAmount:    { type: Number, required: true },
    photos:              [{ type: String }],
    justification:       { type: String, required: true },
    originalQuoteAmount: { type: Number },
    percentageIncrease:  { type: Number },
    requiresApproval:    { type: Boolean, default: false },
    status:              { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    requestedAt:         { type: Date, default: Date.now },
    actedBy:             { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actedAsDelegate:     { type: Boolean, default: false },
    actedAt:             { type: Date },
    remindedAt:          { type: Date },
    escalatedAt:         { type: Date }
  }],
  isScopeApprovalPending: { type: Boolean, default: false },

  // Change 2 — Warranty direct-contact flag
  directContactFlag:      { type: Boolean, default: false },
  directContactNotes:     { type: String, default: '' },
  directContactFlaggedAt: { type: Date },
  directContactFlaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Change 3 — Quote Builder margin check (Dual storage for initial quoted vs actual post-revisions)
  quotedMargin:           { type: Number, default: 0 },
  actualMargin:           { type: Number, default: 0 },
  revisedSubtotal:        { type: Number, default: 0 },
  revisedCustomerTotal:   { type: Number, default: 0 },

  // Change 4 — Time-per-job tracking & stage timestamps
  stageTimestamps: {
    booking:  { type: Date },
    contact:  { type: Date },
    quote:    { type: Date },
    approval: { type: Date },
    delivery: { type: Date }
  },
  edgeCaseFlags: [{
    type:       { type: String, enum: ['payment_retry', 'scope_change', 'dispute'] },
    flaggedAt:  { type: Date, default: Date.now },
    retryCount: { type: Number, default: 1 },
    details:    { type: String }
  }],
  isEdgeCase: { type: Boolean, default: false },

  // Change 5 — Delegate mode for founder unavailability
  delegate: {
    name:       { type: String },
    email:      { type: String },
    phone:      { type: String },
    assignedAt: { type: Date },
    expiresAt:  { type: Date },
    accessCode: { type: String },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
}, { timestamps: true });

// Fix 7 — Auto-derive isEdgeCase from edgeCaseFlags array before save
jobSchema.pre('save', function () {
  this.isEdgeCase = Boolean(this.edgeCaseFlags && this.edgeCaseFlags.length > 0);
});

export default mongoose.model('Job', jobSchema);
