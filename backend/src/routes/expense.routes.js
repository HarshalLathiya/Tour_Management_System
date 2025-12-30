const express = require('express');
const router = express.Router();
const {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getExpensesByTour
} = require('../controllers/expense.controller');
const { protect } = require('../middlewares/auth.middleware');
const { roleCheck } = require('../middlewares/role.middleware');

// All routes require authentication
router.use(protect);

// Admin and organizer routes
router.post('/', roleCheck(['admin', 'organizer']), createExpense);
router.put('/:id', roleCheck(['admin', 'organizer']), updateExpense);
router.delete('/:id', roleCheck(['admin', 'organizer']), deleteExpense);

// All authenticated users
router.get('/', getExpenses);
router.get('/:id', getExpenseById);
router.get('/tour/:tourId', getExpensesByTour);

module.exports = router;
