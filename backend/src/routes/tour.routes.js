const express = require('express');
const router = express.Router();
const {
    createTour,
    getTours,
    getTourById,
    updateTour,
    deleteTour,
    getToursByOrganization
} = require('../controllers/tour.controller');
const { protect } = require('../middlewares/auth.middleware');
const { roleCheck } = require('../middlewares/role.middleware');

// All routes require authentication
router.use(protect);

// Admin and organizer routes
router.post('/', roleCheck(['admin', 'organizer']), createTour);
router.put('/:id', roleCheck(['admin', 'organizer']), updateTour);
router.delete('/:id', roleCheck(['admin', 'organizer']), deleteTour);

// All authenticated users
router.get('/', getTours);
router.get('/:id', getTourById);
router.get('/organization/:organizationId', getToursByOrganization);

module.exports = router;
