import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
    name: String,
    age: Number,
    gender: String,
    phone: String,
    emergencyContact: String,
    documents: [{ type: String, fileUrl: String }],
    medicalNotes: String,
    status: String
}, { timestamps: true });

export default mongoose.model('Participant', participantSchema);
