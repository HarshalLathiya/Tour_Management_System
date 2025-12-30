const { logger } = require('../config/logger');

// Middleware to check if user has required role
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (req.user.role !== requiredRole) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required role: ${requiredRole}`
                });
            }

            next();
        } catch (error) {
            logger.error(`Role middleware error: ${error.message}`);
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    };
};

// Middleware to check if user has one of the required roles
const requireRoles = (...roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required roles: ${roles.join(', ')}`
                });
            }

            next();
        } catch (error) {
            logger.error(`Role middleware error: ${error.message}`);
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    };
};

// Middleware to check if user is admin
const requireAdmin = requireRole('admin');

// Middleware to check if user is organizer or admin
const requireOrganizerOrAdmin = requireRoles('organizer', 'admin');

// Middleware to check if user is participant, organizer, or admin
const requireParticipantOrAbove = requireRoles('participant', 'organizer', 'admin');

// Middleware to check if user has one of the required roles (accepts array)
const roleCheck = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Required roles: ${roles.join(', ')}`
                });
            }

            next();
        } catch (error) {
            logger.error(`Role middleware error: ${error.message}`);
            return res.status(500).json({
                success: false,
                message: 'Server error'
            });
        }
    };
};

module.exports = {
    requireRole,
    requireRoles,
    requireAdmin,
    requireOrganizerOrAdmin,
    requireParticipantOrAbove,
    roleCheck
};
