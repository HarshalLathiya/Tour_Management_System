import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    tourId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true },
    totalBudget: Number,
    currency: { type: String, default: 'INR' }
}, { timestamps: true });

export default mongoose.model('Budget', budgetSchema);
