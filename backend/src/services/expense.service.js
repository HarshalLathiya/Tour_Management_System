const Expense = require('../models/Expense.model');

class ExpenseService {
    // Create a new expense
    async createExpense(expenseData) {
        try {
            const expense = new Expense(expenseData);
            await expense.save();
            return expense;
        } catch (error) {
            throw new Error(`Error creating expense: ${error.message}`);
        }
    }

    // Get all expenses
    async getExpenses() {
        try {
            const expenses = await Expense.find().populate('tourId incurredBy');
            return expenses;
        } catch (error) {
            throw new Error(`Error fetching expenses: ${error.message}`);
        }
    }

    // Get expense by ID
    async getExpenseById(id) {
        try {
            const expense = await Expense.findById(id).populate('tourId incurredBy');
            if (!expense) {
                throw new Error('Expense not found');
            }
            return expense;
        } catch (error) {
            throw new Error(`Error fetching expense: ${error.message}`);
        }
    }

    // Update expense
    async updateExpense(id, updateData) {
        try {
            const expense = await Expense.findByIdAndUpdate(id, updateData, { new: true }).populate('tourId incurredBy');
            if (!expense) {
                throw new Error('Expense not found');
            }
            return expense;
        } catch (error) {
            throw new Error(`Error updating expense: ${error.message}`);
        }
    }

    // Delete expense
    async deleteExpense(id) {
        try {
            const expense = await Expense.findByIdAndDelete(id);
            if (!expense) {
                throw new Error('Expense not found');
            }
            return expense;
        } catch (error) {
            throw new Error(`Error deleting expense: ${error.message}`);
        }
    }

    // Get expenses by tour
    async getExpensesByTour(tourId) {
        try {
            const expenses = await Expense.find({ tourId }).populate('tourId incurredBy');
            return expenses;
        } catch (error) {
            throw new Error(`Error fetching expenses by tour: ${error.message}`);
        }
    }

    // Calculate total expenses for a tour
    async calculateTotalExpenses(tourId) {
        try {
            const expenses = await Expense.find({ tourId });
            const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
            return totalExpenses;
        } catch (error) {
            throw new Error(`Error calculating total expenses: ${error.message}`);
        }
    }

    // Get expense summary for a tour
    async getExpenseSummary(tourId) {
        try {
            const expenses = await Expense.find({ tourId });
            const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
            const categories = expenses.reduce((acc, expense) => {
                acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
                return acc;
            }, {});

            return {
                totalExpenses,
                categories,
                itemCount: expenses.length
            };
        } catch (error) {
            throw new Error(`Error fetching expense summary: ${error.message}`);
        }
    }
}

module.exports = new ExpenseService();
