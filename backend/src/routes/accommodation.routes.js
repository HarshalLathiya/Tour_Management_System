const express = require('express');
const router = express.Router();
const {
    createAccommodation,
    getAccommodations,
    getAccommodationById,
    updateAccommodation,
    deleteAccommodation,
    getAccommodationsByTour
} = require('../controllers/accommodation.controller');
const { protect } = require('../middlewares/auth.middleware');
const { roleCheck } = require('../middlewares/role.middleware');

router.use(protect);

router.post('/', roleCheck(['admin', 'organizer']), createAccommodation);
router.put('/:id', roleCheck(['admin', 'organizer']), updateAccommodation);
router.delete('/:id', roleCheck(['admin', 'organizer']), deleteAccommodation);

router.get('/', getAccommodations);
router.get('/:id', getAccommodationById);
router.get('/tour/:tourId', getAccommodationsByTour);

module.exports = router;
