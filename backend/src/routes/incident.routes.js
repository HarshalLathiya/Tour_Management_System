const express = require('express');
const router = express.Router();
const {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncident,
    deleteIncident,
    getIncidentsByTour
} = require('../controllers/incident.controller');
const { protect } = require('../middlewares/auth.middleware');
const { roleCheck } = require('../middlewares/role.middleware');

// All routes require authentication
router.use(protect);

// Admin and organizer routes
router.post('/', roleCheck(['admin', 'organizer']), createIncident);
router.put('/:id', roleCheck(['admin', 'organizer']), updateIncident);
router.delete('/:id', roleCheck(['admin', 'organizer']), deleteIncident);

// All authenticated users
router.get('/', getIncidents);
router.get('/:id', getIncidentById);
router.get('/tour/:tourId', getIncidentsByTour);

module.exports = router;
