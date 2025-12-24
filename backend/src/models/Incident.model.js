import mongoose from 'mongoose';
import { INCIDENT_SEVERITY } from '../utils/constants.js';

const incidentSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: String,
    severity: { type: String, enum: Object.values(INCIDENT_SEVERITY) }
}, { timestamps: true });

export default mongoose.model('Incident', incidentSchema);
