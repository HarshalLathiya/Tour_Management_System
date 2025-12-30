const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Organization name is required'],
        trim: true
    },
    type: {
        type: String,
        enum: ['school', 'college', 'company', 'club', 'nonprofit', 'other'],
        required: [true, 'Organization type is required']
    },
    description: {
        type: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    contact: {
        email: String,
        phone: String,
        website: String
    },
    logo: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['admin', 'organizer', 'member'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    settings: {
        allowPublicTours: {
            type: Boolean,
            default: false
        },
        maxToursPerMonth: {
            type: Number,
            default: 10
        },
        defaultCurrency: {
            type: String,
            default: 'USD'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

organizationSchema.index({ name: 'text' });

module.exports = mongoose.model('Organization', organizationSchema);
