const express = require('express');
const router = express.Router();
const {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget,
    getBudgetsByTour
} = require('../controllers/budget.controller');
const { protect } = require('../middlewares/auth.middleware');
const { roleCheck } = require('../middlewares/role.middleware');

// All routes require authentication
router.use(protect);

// Admin and organizer routes
router.post('/', roleCheck(['admin', 'organizer']), createBudget);
router.put('/:id', roleCheck(['admin', 'organizer']), updateBudget);
router.delete('/:id', roleCheck(['admin', 'organizer']), deleteBudget);

// All authenticated users
router.get('/', getBudgets);
router.get('/:id', getBudgetById);
router.get('/tour/:tourId', getBudgetsByTour);

module.exports = router;
