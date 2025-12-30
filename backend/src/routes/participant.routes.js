const express = require('express');
const router = express.Router();
const {
    createParticipant,
    getParticipants,
    getParticipantById,
    updateParticipant,
    deleteParticipant,
    getParticipantsByTour
} = require('../controllers/participant.controller');
const { protect } = require('../middlewares/auth.middleware');
const { roleCheck } = require('../middlewares/role.middleware');

// All routes require authentication
router.use(protect);

// Admin and organizer routes
router.post('/', roleCheck(['admin', 'organizer']), createParticipant);
router.put('/:id', roleCheck(['admin', 'organizer']), updateParticipant);
router.delete('/:id', roleCheck(['admin', 'organizer']), deleteParticipant);

// All authenticated users
router.get('/', getParticipants);
router.get('/:id', getParticipantById);
router.get('/tour/:tourId', getParticipantsByTour);

module.exports = router;
