const Budget = require('../models/Budget.model');
const { responseUtil } = require('../utils/response.util');

// Create a new budget
const createBudget = async (req, res) => {
    try {
        const budget = new Budget(req.body);
        await budget.save();
        responseUtil.success(res, 'Budget created successfully', budget, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

// Get all budgets
const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find().populate('tour');
        responseUtil.success(res, 'Budgets retrieved successfully', budgets);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Get budget by ID
const getBudgetById = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id).populate('tour');
        if (!budget) {
            return responseUtil.error(res, 'Budget not found', 404);
        }
        responseUtil.success(res, 'Budget retrieved successfully', budget);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Update budget
const updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!budget) {
            return responseUtil.error(res, 'Budget not found', 404);
        }
        responseUtil.success(res, 'Budget updated successfully', budget);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

// Delete budget
const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findByIdAndDelete(req.params.id);
        if (!budget) {
            return responseUtil.error(res, 'Budget not found', 404);
        }
        responseUtil.success(res, 'Budget deleted successfully');
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Get budgets by tour
const getBudgetsByTour = async (req, res) => {
    try {
        const budgets = await Budget.find({ tour: req.params.tourId });
        responseUtil.success(res, 'Budgets retrieved successfully', budgets);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

module.exports = {
    createBudget,
    getBudgets,
    getBudgetById,
    updateBudget,
    deleteBudget,
    getBudgetsByTour
};
