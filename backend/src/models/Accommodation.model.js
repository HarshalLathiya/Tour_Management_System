const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Accommodation name is required']
    },
    type: {
        type: String,
        enum: ['hotel', 'hostel', 'resort', 'apartment', 'campsite', 'other'],
        default: 'hotel'
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    checkIn: {
        type: Date,
        required: [true, 'Check-in date is required']
    },
    checkOut: {
        type: Date,
        required: [true, 'Check-out date is required']
    },
    roomType: {
        type: String
    },
    numberOfRooms: {
        type: Number,
        default: 1
    },
    capacity: {
        type: Number
    },
    pricePerNight: {
        type: Number
    },
    totalPrice: {
        type: Number
    },
    currency: {
        type: String,
        default: 'USD'
    },
    contactPerson: {
        name: String,
        phone: String,
        email: String
    },
    bookingReference: {
        type: String
    },
    amenities: [{
        type: String
    }],
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

accommodationSchema.index({ tour: 1 });

module.exports = mongoose.model('Accommodation', accommodationSchema);
