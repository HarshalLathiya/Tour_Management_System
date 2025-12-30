const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Budget name is required']
    },
    description: {
        type: String
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: 0
    },
    allocatedAmount: {
        type: Number,
        default: 0
    },
    spentAmount: {
        type: Number,
        default: 0
    },
    remainingAmount: {
        type: Number,
        default: function () {
            return this.totalAmount - this.spentAmount;
        }
    },
    categories: [{
        name: {
            type: String,
            required: true
        },
        allocated: {
            type: Number,
            required: true,
            min: 0
        },
        spent: {
            type: Number,
            default: 0
        },
        remaining: {
            type: Number,
            default: function () {
                return this.allocated - this.spent;
            }
        }
    }],
    status: {
        type: String,
        enum: ['draft', 'active', 'locked', 'archived'],
        default: 'draft'
    },
    currency: {
        type: String,
        default: 'USD'
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    lockedAt: {
        type: Date
    },
    lockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Virtual for utilization percentage
budgetSchema.virtual('utilization').get(function () {
    if (this.totalAmount === 0) return 0;
    return (this.spentAmount / this.totalAmount) * 100;
});

module.exports = mongoose.model('Budget', budgetSchema);