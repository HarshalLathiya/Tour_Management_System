const mongoose = require('mongoose');
const { INCIDENT_SEVERITY } = require('../utils/constants');

const incidentSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Incident title is required']
    },
    description: {
        type: String,
        required: [true, 'Incident description is required']
    },
    severity: {
        type: String,
        enum: Object.values(INCIDENT_SEVERITY),
        default: INCIDENT_SEVERITY.LOW
    },
    category: {
        type: String,
        enum: ['health', 'safety', 'equipment', 'weather', 'transport', 'accommodation', 'other'],
        default: 'other'
    },
    location: {
        type: String
    },
    dateOccurred: {
        type: Date,
        default: Date.now
    },
    personsInvolved: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        name: String,
        role: String
    }],
    actionsTaken: [{
        action: String,
        takenBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        dateTime: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['reported', 'investigating', 'resolved', 'closed'],
        default: 'reported'
    },
    resolution: {
        type: String
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: {
        type: Date
    },
    attachments: [{
        url: String,
        filename: String,
        type: String
    }],
    notes: {
        type: String
    }
}, {
    timestamps: true
});

incidentSchema.index({ tour: 1, severity: 1 });

module.exports = mongoose.model('Incident', incidentSchema);
