const Budget = require('../models/Budget.model');

class BudgetService {
    // Create a new budget
    async createBudget(budgetData) {
        try {
            const budget = new Budget(budgetData);
            await budget.save();
            return budget;
        } catch (error) {
            throw new Error(`Error creating budget: ${error.message}`);
        }
    }

    // Get all budgets
    async getBudgets() {
        try {
            const budgets = await Budget.find().populate('tourId');
            return budgets;
        } catch (error) {
            throw new Error(`Error fetching budgets: ${error.message}`);
        }
    }

    // Get budget by ID
    async getBudgetById(id) {
        try {
            const budget = await Budget.findById(id).populate('tourId');
            if (!budget) {
                throw new Error('Budget not found');
            }
            return budget;
        } catch (error) {
            throw new Error(`Error fetching budget: ${error.message}`);
        }
    }

    // Update budget
    async updateBudget(id, updateData) {
        try {
            const budget = await Budget.findByIdAndUpdate(id, updateData, { new: true }).populate('tourId');
            if (!budget) {
                throw new Error('Budget not found');
            }
            return budget;
        } catch (error) {
            throw new Error(`Error updating budget: ${error.message}`);
        }
    }

    // Delete budget
    async deleteBudget(id) {
        try {
            const budget = await Budget.findByIdAndDelete(id);
            if (!budget) {
                throw new Error('Budget not found');
            }
            return budget;
        } catch (error) {
            throw new Error(`Error deleting budget: ${error.message}`);
        }
    }

    // Get budgets by tour
    async getBudgetsByTour(tourId) {
        try {
            const budgets = await Budget.find({ tourId }).populate('tourId');
            return budgets;
        } catch (error) {
            throw new Error(`Error fetching budgets by tour: ${error.message}`);
        }
    }

    // Calculate total budget for a tour
    async calculateTotalBudget(tourId) {
        try {
            const budgets = await Budget.find({ tourId });
            const totalBudget = budgets.reduce((total, budget) => total + budget.amount, 0);
            return totalBudget;
        } catch (error) {
            throw new Error(`Error calculating total budget: ${error.message}`);
        }
    }

    // Get budget summary for a tour
    async getBudgetSummary(tourId) {
        try {
            const budgets = await Budget.find({ tourId });
            const totalBudget = budgets.reduce((total, budget) => total + budget.amount, 0);
            const categories = budgets.reduce((acc, budget) => {
                acc[budget.category] = (acc[budget.category] || 0) + budget.amount;
                return acc;
            }, {});

            return {
                totalBudget,
                categories,
                itemCount: budgets.length
            };
        } catch (error) {
            throw new Error(`Error fetching budget summary: ${error.message}`);
        }
    }
}

module.exports = new BudgetService();
