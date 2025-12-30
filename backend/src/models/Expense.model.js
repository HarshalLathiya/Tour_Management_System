const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: true
    },
    budget: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Budget'
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['accommodation', 'transport', 'food', 'activities', 'equipment', 'miscellaneous']
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    date: {
        type: Date,
        default: Date.now
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receipt: {
        url: String,
        filename: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'reimbursed'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

expenseSchema.index({ tour: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
