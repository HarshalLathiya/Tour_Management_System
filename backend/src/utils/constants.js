const USER_ROLES = {
    ADMIN: 'admin',
    ORGANIZER: 'organizer',
    COORDINATOR: 'coordinator',
    PARTICIPANT: 'participant'
};

const TOUR_STATUS = {
    DRAFT: 'draft',
    PLANNED: 'planned',
    ONGOING: 'ongoing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

const INCIDENT_SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

const PAYMENT_STATUS = {
    PENDING: 'pending',
    PARTIAL: 'partial',
    PAID: 'paid',
    REFUNDED: 'refunded'
};

const PARTICIPANT_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    WAITLISTED: 'waitlisted',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed'
};

const BUDGET_STATUS = {
    DRAFT: 'draft',
    ACTIVE: 'active',
    LOCKED: 'locked',
    ARCHIVED: 'archived'
};

module.exports = {
    USER_ROLES,
    TOUR_STATUS,
    INCIDENT_SEVERITY,
    PAYMENT_STATUS,
    PARTICIPANT_STATUS,
    BUDGET_STATUS
};
