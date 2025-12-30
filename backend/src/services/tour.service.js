const Tour = require('../models/Tour.model');

class TourService {
    // Create a new tour
    async createTour(tourData) {
        try {
            const tour = new Tour(tourData);
            await tour.save();
            return tour;
        } catch (error) {
            throw new Error(`Error creating tour: ${error.message}`);
        }
    }

    // Get all tours
    async getTours() {
        try {
            const tours = await Tour.find().populate('organizationId organizerId');
            return tours;
        } catch (error) {
            throw new Error(`Error fetching tours: ${error.message}`);
        }
    }

    // Get tour by ID
    async getTourById(id) {
        try {
            const tour = await Tour.findById(id).populate('organizationId organizerId');
            if (!tour) {
                throw new Error('Tour not found');
            }
            return tour;
        } catch (error) {
            throw new Error(`Error fetching tour: ${error.message}`);
        }
    }

    // Update tour
    async updateTour(id, updateData) {
        try {
            const tour = await Tour.findByIdAndUpdate(id, updateData, { new: true }).populate('organizationId organizerId');
            if (!tour) {
                throw new Error('Tour not found');
            }
            return tour;
        } catch (error) {
            throw new Error(`Error updating tour: ${error.message}`);
        }
    }

    // Delete tour
    async deleteTour(id) {
        try {
            const tour = await Tour.findByIdAndDelete(id);
            if (!tour) {
                throw new Error('Tour not found');
            }
            return tour;
        } catch (error) {
            throw new Error(`Error deleting tour: ${error.message}`);
        }
    }

    // Get tours by organization
    async getToursByOrganization(organizationId) {
        try {
            const tours = await Tour.find({ organizationId }).populate('organizationId organizerId');
            return tours;
        } catch (error) {
            throw new Error(`Error fetching tours by organization: ${error.message}`);
        }
    }

    // Get tours by organizer
    async getToursByOrganizer(organizerId) {
        try {
            const tours = await Tour.find({ organizerId }).populate('organizationId organizerId');
            return tours;
        } catch (error) {
            throw new Error(`Error fetching tours by organizer: ${error.message}`);
        }
    }

    // Get tour statistics
    async getTourStats(id) {
        try {
            const tour = await Tour.findById(id);
            if (!tour) {
                throw new Error('Tour not found');
            }

            // Get related counts
            const Participant = require('../models/Participant.model');
            const Budget = require('../models/Budget.model');
            const Incident = require('../models/Incident.model');

            const participantCount = await Participant.countDocuments({ tourId: id });
            const budgetCount = await Budget.countDocuments({ tourId: id });
            const incidentCount = await Incident.countDocuments({ tourId: id });

            return {
                tour,
                stats: {
                    totalParticipants: participantCount,
                    totalBudgets: budgetCount,
                    totalIncidents: incidentCount
                }
            };
        } catch (error) {
            throw new Error(`Error fetching tour stats: ${error.message}`);
        }
    }

    // Update tour status
    async updateTourStatus(id, status) {
        try {
            const tour = await Tour.findByIdAndUpdate(id, { status }, { new: true }).populate('organizationId organizerId');
            if (!tour) {
                throw new Error('Tour not found');
            }
            return tour;
        } catch (error) {
            throw new Error(`Error updating tour status: ${error.message}`);
        }
    }
}

module.exports = new TourService();
