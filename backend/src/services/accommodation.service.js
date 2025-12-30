const Accommodation = require('../models/Accommodation.model');

class AccommodationService {
    // Create a new accommodation
    async createAccommodation(accommodationData) {
        try {
            const accommodation = new Accommodation(accommodationData);
            await accommodation.save();
            return accommodation;
        } catch (error) {
            throw new Error(`Error creating accommodation: ${error.message}`);
        }
    }

    // Get all accommodations
    async getAccommodations() {
        try {
            const accommodations = await Accommodation.find().populate('tourId');
            return accommodations;
        } catch (error) {
            throw new Error(`Error fetching accommodations: ${error.message}`);
        }
    }

    // Get accommodation by ID
    async getAccommodationById(id) {
        try {
            const accommodation = await Accommodation.findById(id).populate('tourId');
            if (!accommodation) {
                throw new Error('Accommodation not found');
            }
            return accommodation;
        } catch (error) {
            throw new Error(`Error fetching accommodation: ${error.message}`);
        }
    }

    // Update accommodation
    async updateAccommodation(id, updateData) {
        try {
            const accommodation = await Accommodation.findByIdAndUpdate(id, updateData, { new: true }).populate('tourId');
            if (!accommodation) {
                throw new Error('Accommodation not found');
            }
            return accommodation;
        } catch (error) {
            throw new Error(`Error updating accommodation: ${error.message}`);
        }
    }

    // Delete accommodation
    async deleteAccommodation(id) {
        try {
            const accommodation = await Accommodation.findByIdAndDelete(id);
            if (!accommodation) {
                throw new Error('Accommodation not found');
            }
            return accommodation;
        } catch (error) {
            throw new Error(`Error deleting accommodation: ${error.message}`);
        }
    }

    // Get accommodations by tour
    async getAccommodationsByTour(tourId) {
        try {
            const accommodations = await Accommodation.find({ tourId }).populate('tourId');
            return accommodations;
        } catch (error) {
            throw new Error(`Error fetching accommodations by tour: ${error.message}`);
        }
    }

    // Get accommodation statistics
    async getAccommodationStats(tourId) {
        try {
            const accommodations = await Accommodation.find({ tourId });
            const totalAccommodations = accommodations.length;
            const totalCost = accommodations.reduce((total, acc) => total + acc.cost, 0);
            const averageCost = totalAccommodations > 0 ? totalCost / totalAccommodations : 0;

            return {
                totalAccommodations,
                totalCost,
                averageCost
            };
        } catch (error) {
            throw new Error(`Error fetching accommodation stats: ${error.message}`);
        }
    }
}

module.exports = new AccommodationService();
