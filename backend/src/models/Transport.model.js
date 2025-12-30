const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: true
    },
    type: {
        type: String,
        enum: ['bus', 'train', 'flight', 'car', 'van', 'boat', 'other'],
        required: [true, 'Transport type is required']
    },
    provider: {
        name: String,
        contact: String,
        email: String
    },
    vehicleNumber: {
        type: String
    },
    driverInfo: {
        name: String,
        phone: String,
        licenseNumber: String
    },
    departure: {
        location: String,
        dateTime: Date
    },
    arrival: {
        location: String,
        dateTime: Date
    },
    capacity: {
        type: Number
    },
    bookedSeats: {
        type: Number,
        default: 0
    },
    pricePerPerson: {
        type: Number
    },
    totalPrice: {
        type: Number
    },
    currency: {
        type: String,
        default: 'USD'
    },
    bookingReference: {
        type: String
    },
    amenities: [{
        type: String
    }],
    safetyNotes: {
        type: String
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

transportSchema.index({ tour: 1 });

module.exports = mongoose.model('Transport', transportSchema);
