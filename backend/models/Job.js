import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  quoteId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', required: true },
  requestId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
  garageId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Garage', required: true },
  helperId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Helper', default: null },
  status:            { type: String, default: 'pickup_scheduled' },
  startDate:         { type: Date },
  estimatedEndDate:  { type: Date },
  actualEndDate:     { type: Date },
  estimatedArrival:  { type: Date },
  photos:            [{ type: String }],
  notes:             { type: String },
  conditionReportId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleConditionReport', default: null }
}, { timestamps: true });

export default mongoose.model('Job', jobSchema);
