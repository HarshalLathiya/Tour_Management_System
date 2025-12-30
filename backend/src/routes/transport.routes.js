const express = require('express');
const router = express.Router();
const {
    createTransport,
    getTransports,
    getTransportById,
    updateTransport,
    deleteTransport,
    getTransportsByTour
} = require('../controllers/transport.controller');
const { protect } = require('../middlewares/auth.middleware');
const { roleCheck } = require('../middlewares/role.middleware');

// All routes require authentication
router.use(protect);

// Admin and organizer routes
router.post('/', roleCheck(['admin', 'organizer']), createTransport);
router.put('/:id', roleCheck(['admin', 'organizer']), updateTransport);
router.delete('/:id', roleCheck(['admin', 'organizer']), deleteTransport);

// All authenticated users
router.get('/', getTransports);
router.get('/:id', getTransportById);
router.get('/tour/:tourId', getTransportsByTour);

module.exports = router;
