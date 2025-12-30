const Transport = require('../models/Transport.model');

class TransportService {
    // Create a new transport
    async createTransport(transportData) {
        try {
            const transport = new Transport(transportData);
            await transport.save();
            return transport;
        } catch (error) {
            throw new Error(`Error creating transport: ${error.message}`);
        }
    }

    // Get all transports
    async getTransports() {
        try {
            const transports = await Transport.find().populate('tourId');
            return transports;
        } catch (error) {
            throw new Error(`Error fetching transports: ${error.message}`);
        }
    }

    // Get transport by ID
    async getTransportById(id) {
        try {
            const transport = await Transport.findById(id).populate('tourId');
            if (!transport) {
                throw new Error('Transport not found');
            }
            return transport;
        } catch (error) {
            throw new Error(`Error fetching transport: ${error.message}`);
        }
    }

    // Update transport
    async updateTransport(id, updateData) {
        try {
            const transport = await Transport.findByIdAndUpdate(id, updateData, { new: true }).populate('tourId');
            if (!transport) {
                throw new Error('Transport not found');
            }
            return transport;
        } catch (error) {
            throw new Error(`Error updating transport: ${error.message}`);
        }
    }

    // Delete transport
    async deleteTransport(id) {
        try {
            const transport = await Transport.findByIdAndDelete(id);
            if (!transport) {
                throw new Error('Transport not found');
            }
            return transport;
        } catch (error) {
            throw new Error(`Error deleting transport: ${error.message}`);
        }
    }

    // Get transports by tour
    async getTransportsByTour(tourId) {
        try {
            const transports = await Transport.find({ tourId }).populate('tourId');
            return transports;
        } catch (error) {
            throw new Error(`Error fetching transports by tour: ${error.message}`);
        }
    }

    // Get transport statistics
    async getTransportStats(tourId) {
        try {
            const transports = await Transport.find({ tourId });
            const totalTransports = transports.length;
            const totalCost = transports.reduce((total, transport) => total + transport.cost, 0);
            const averageCost = totalTransports > 0 ? totalCost / totalTransports : 0;

            return {
                totalTransports,
                totalCost,
                averageCost
            };
        } catch (error) {
            throw new Error(`Error fetching transport stats: ${error.message}`);
        }
    }
}

module.exports = new TransportService();
