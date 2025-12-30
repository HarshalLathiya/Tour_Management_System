const Expense = require('../models/Expense.model');
const { responseUtil } = require('../utils/response.util');

const createExpense = async (req, res) => {
    try {
        const expense = new Expense({
            ...req.body,
            paidBy: req.body.paidBy || req.user.id
        });
        await expense.save();
        responseUtil.success(res, 'Expense created successfully', expense, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find()
            .populate('tour', 'name')
            .populate('paidBy', 'firstName lastName email')
            .populate('approvedBy', 'firstName lastName');
        responseUtil.success(res, 'Expenses retrieved successfully', expenses);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id)
            .populate('tour', 'name')
            .populate('paidBy', 'firstName lastName email')
            .populate('approvedBy', 'firstName lastName');
        if (!expense) {
            return responseUtil.error(res, 'Expense not found', 404);
        }
        responseUtil.success(res, 'Expense retrieved successfully', expense);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!expense) {
            return responseUtil.error(res, 'Expense not found', 404);
        }
        responseUtil.success(res, 'Expense updated successfully', expense);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) {
            return responseUtil.error(res, 'Expense not found', 404);
        }
        responseUtil.success(res, 'Expense deleted successfully');
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const getExpensesByTour = async (req, res) => {
    try {
        const expenses = await Expense.find({ tour: req.params.tourId })
            .populate('paidBy', 'firstName lastName email')
            .populate('approvedBy', 'firstName lastName');
        responseUtil.success(res, 'Expenses retrieved successfully', expenses);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const approveExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(
            req.params.id,
            {
                status: 'approved',
                approvedBy: req.user.id,
                approvedAt: new Date()
            },
            { new: true }
        );
        if (!expense) {
            return responseUtil.error(res, 'Expense not found', 404);
        }
        responseUtil.success(res, 'Expense approved successfully', expense);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const rejectExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(
            req.params.id,
            {
                status: 'rejected',
                notes: req.body.reason || 'Rejected'
            },
            { new: true }
        );
        if (!expense) {
            return responseUtil.error(res, 'Expense not found', 404);
        }
        responseUtil.success(res, 'Expense rejected', expense);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

module.exports = {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getExpensesByTour,
    approveExpense,
    rejectExpense
};
