import mongoose from 'mongoose';

const conditionReportSchema = new mongoose.Schema({
  jobId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  odometer:     { type: Number, required: true },
  fuelLevel:    { type: String, enum: ['empty','quarter','half','three_quarter','full'], required: true },
  damageNotes:  { type: String },
  photos:       [{ type: String }],
  pickupDateTime:{ type: Date, default: Date.now },
  driverName:   { type: String }
}, { timestamps: true });

export default mongoose.model('VehicleConditionReport', conditionReportSchema);
