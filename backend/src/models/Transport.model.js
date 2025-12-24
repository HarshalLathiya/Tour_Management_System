import mongoose from 'mongoose';

const transportSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
    vehicleType: String,
    vehicleNumber: String,
    driverName: String,
    driverContact: String,
    safetyNotes: String
}, { timestamps: true });

export default mongoose.model('Transport', transportSchema);
