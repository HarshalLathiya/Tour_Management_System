const Budget = require('../models/Budget.model');
const { responseUtil } = require('../utils/response.util');

const createBudget = async (req, res) => {
    try {
        const budget = new Budget(req.body);
        await budget.save();
        responseUtil.success(res, 'Budget created successfully', budget, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find().populate('tour', 'name');
        responseUtil.success(res, 'Budgets retrieved successfully', budgets);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const getBudgetById = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id).populate('tour', 'name');
        if (!budget) {
            return responseUtil.error(res, 'Budget not found', 404);
        }
        responseUtil.success(res, 'Budget retrieved successfully', budget);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        if (!budget) {
            return responseUtil.error(res, 'Budget not found', 404);
        }
        
        if (budget.isLocked) {
            return responseUtil.error(res, 'Budget is locked and cannot be modified', 400);
        }

        const updatedBudget = await Budget.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        responseUtil.success(res, 'Budget updated successfully', updatedBudget);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        if (!budget) {
            return responseUtil.error(res, 'Budget not found', 404);
        }
        
        if (budget.isLocked) {
            return responseUtil.error(res, 'Budget is locked and cannot be deleted', 400);
        }

        await Budget.findByIdAndDelete(req.params.id);
        responseUtil.success(res, 'Budget deleted successfully');
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const getBudgetsByTour = async (req, res) => {
    try {
        const budgets = await Budget.find({ tour: req.params.tourId });
        responseUtil.success(res, 'Budgets retrieved successfully', budgets);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const lockBudget = async (req, res) => {
    try {
        const budget = await Budget.findByIdAndUpdate(
            req.params.id,
            {
                isLocked: true,
                lockedAt: new Date(),
                lockedBy: req.user.id,
                status: 'locked'
            },
            { new: true }
        );
        if (!budget) {
            return responseUtil.error(res, 'Budget not found', 404);
        }
        responseUtil.success(res, 'Budget locked successfully', budget);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const unlockBudget = async (req, res) => {
    try {
        const budget = await Budget.findByIdAndUpdate(
            req.params.id,
            {
                isLocked: false,
                lockedAt: null,
                lockedBy: null,
                status: 'active'
            },
            { new: true }
        );
        if (!budget) {
            return responseUtil.error(res, 'Budget not found', 404);
        }
        responseUtil.success(res, 'Budget unlocked successfully', budget);
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
    getBudgetsByTour,
    lockBudget,
    unlockBudget
};
