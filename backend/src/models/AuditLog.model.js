import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: String,
    entityType: String,
    entityId: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);
