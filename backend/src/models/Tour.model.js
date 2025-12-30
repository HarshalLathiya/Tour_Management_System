const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tour name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    location: {
        type: String,
        required: [true, 'Location is required']
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'planned', 'ongoing', 'completed', 'cancelled'],
        default: 'draft'
    },
    maxParticipants: {
        type: Number,
        required: [true, 'Maximum participants is required'],
        min: 1
    },
    currentParticipants: {
        type: Number,
        default: 0
    },
    requirements: [{
        type: String
    }],
    itinerary: [{
        day: Number,
        date: Date,
        activities: [String],
        accommodations: String,
        meals: [String]
    }],
    images: [{
        url: String,
        caption: String
    }],
    documents: [{
        name: String,
        url: String,
        type: String
    }],
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Virtual for duration in days
tourSchema.virtual('duration').get(function () {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

// Index for search
tourSchema.index({ name: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Tour', tourSchema);