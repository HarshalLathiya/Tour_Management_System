const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'waitlisted', 'cancelled', 'completed'],
        default: 'pending'
    },
    emergencyContact: {
        name: String,
        phone: String,
        relationship: String
    },
    medicalInfo: {
        conditions: [String],
        allergies: [String],
        medications: [String],
        dietaryRestrictions: [String]
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'partial', 'paid', 'refunded'],
        default: 'pending'
    },
    amountPaid: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true
    },
    notes: {
        type: String
    },
    accommodations: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Accommodation'
    },
    transport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transport'
    }
}, {
    timestamps: true
});

// Ensure one user can't register twice for same tour
participantSchema.index({ user: 1, tour: 1 }, { unique: true });

module.exports = mongoose.model('Participant', participantSchema);