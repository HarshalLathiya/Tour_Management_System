import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
    category: String,
    amount: Number,
    description: String,
    paidBy: String,
    expenseDate: Date
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
