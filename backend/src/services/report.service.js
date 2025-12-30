const Tour = require('../models/Tour.model');
const Budget = require('../models/Budget.model');
const Expense = require('../models/Expense.model');
const Participant = require('../models/Participant.model');
const Incident = require('../models/Incident.model');
const Organization = require('../models/Organization.model');
const User = require('../models/User.model');

class ReportService {
    // Generate tour report
    async getTourReport(tourId) {
        try {
            const tour = await Tour.findById(tourId).populate('organizationId organizerId');
            if (!tour) {
                throw new Error('Tour not found');
            }

            // Get related data
            const participants = await Participant.find({ tourId });
            const budgets = await Budget.find({ tourId });
            const expenses = await Expense.find({ tourId });
            const incidents = await Incident.find({ tourId });

            // Calculate totals
            const totalBudget = budgets.reduce((total, budget) => total + budget.amount, 0);
            const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
            const totalParticipants = participants.length;
            const totalIncidents = incidents.length;

            return {
                tour,
                summary: {
                    totalParticipants,
                    totalBudget,
                    totalExpenses,
                    budgetUtilization: totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0,
                    totalIncidents
                },
                participants,
                budgets,
                expenses,
                incidents
            };
        } catch (error) {
            throw new Error(`Error generating tour report: ${error.message}`);
        }
    }

    // Generate organization report
    async getOrganizationReport(organizationId) {
        try {
            const organization = await Organization.findById(organizationId);
            if (!organization) {
                throw new Error('Organization not found');
            }

            // Get all tours for the organization
            const tours = await Tour.find({ organizationId }).populate('organizerId');

            // Aggregate data across all tours
            let totalTours = tours.length;
            let totalParticipants = 0;
            let totalBudget = 0;
            let totalExpenses = 0;
            let totalIncidents = 0;

            for (const tour of tours) {
                const participants = await Participant.find({ tourId: tour._id });
                const budgets = await Budget.find({ tourId: tour._id });
                const expenses = await Expense.find({ tourId: tour._id });
                const incidents = await Incident.find({ tourId: tour._id });

                totalParticipants += participants.length;
                totalBudget += budgets.reduce((total, budget) => total + budget.amount, 0);
                totalExpenses += expenses.reduce((total, expense) => total + expense.amount, 0);
                totalIncidents += incidents.length;
            }

            return {
                organization,
                summary: {
                    totalTours,
                    totalParticipants,
                    totalBudget,
                    totalExpenses,
                    budgetUtilization: totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0,
                    totalIncidents
                },
                tours
            };
        } catch (error) {
            throw new Error(`Error generating organization report: ${error.message}`);
        }
    }

    // Generate system-wide report (admin only)
    async getSystemReport() {
        try {
            // Get overall statistics
            const totalOrganizations = await Organization.countDocuments();
            const totalTours = await Tour.countDocuments();
            const totalUsers = await User.countDocuments();
            const totalParticipants = await Participant.countDocuments();
            const totalIncidents = await Incident.countDocuments();

            // Calculate financial totals
            const budgets = await Budget.find();
            const expenses = await Expense.find();
            const totalBudget = budgets.reduce((total, budget) => total + budget.amount, 0);
            const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);

            return {
                summary: {
                    totalOrganizations,
                    totalTours,
                    totalUsers,
                    totalParticipants,
                    totalIncidents,
                    totalBudget,
                    totalExpenses,
                    budgetUtilization: totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0
                }
            };
        } catch (error) {
            throw new Error(`Error generating system report: ${error.message}`);
        }
    }
}

module.exports = new ReportService();
