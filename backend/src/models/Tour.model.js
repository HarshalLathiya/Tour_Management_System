import mongoose from 'mongoose';
import { TOUR_STATUS } from '../utils/constants.js';

const tourSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    title: String,
    description: String,
    startDate: Date,
    endDate: Date,
    status: { type: String, enum: Object.values(TOUR_STATUS), default: TOUR_STATUS.PLANNING },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Tour', tourSchema);
