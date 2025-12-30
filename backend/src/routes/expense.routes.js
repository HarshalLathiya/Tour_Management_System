const express = require('express');
const router = express.Router();
const {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getExpensesByTour,
    approveExpense,
    rejectExpense
} = require('../controllers/expense.controller');
const { protect } = require('../middlewares/auth.middleware');
const { roleCheck } = require('../middlewares/role.middleware');

router.use(protect);

router.post('/', roleCheck(['admin', 'organizer']), createExpense);
router.put('/:id', roleCheck(['admin', 'organizer']), updateExpense);
router.delete('/:id', roleCheck(['admin', 'organizer']), deleteExpense);
router.patch('/:id/approve', roleCheck(['admin', 'organizer']), approveExpense);
router.patch('/:id/reject', roleCheck(['admin', 'organizer']), rejectExpense);

router.get('/', getExpenses);
router.get('/:id', getExpenseById);
router.get('/tour/:tourId', getExpensesByTour);

module.exports = router;
