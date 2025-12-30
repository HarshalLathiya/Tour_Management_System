const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import']
    },
    entityType: {
        type: String,
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId
    },
    changes: {
        before: mongoose.Schema.Types.Mixed,
        after: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    status: {
        type: String,
        enum: ['success', 'failure'],
        default: 'success'
    },
    errorMessage: {
        type: String
    }
}, {
    timestamps: true
});

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ organization: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
