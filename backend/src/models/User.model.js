import mongoose from 'mongoose';
import { USER_ROLES } from '../utils/constants.js';

const userSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: String,
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(USER_ROLES), required: true },
    phone: String,
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date
}, { timestamps: true });

userSchema.index({ email: 1, organizationId: 1 }, { unique: true });

export default mongoose.model('User', userSchema);
