const Transport = require('../models/Transport.model');
const { responseUtil } = require('../utils/response.util');

// Create a new transport
const createTransport = async (req, res) => {
    try {
        const transport = new Transport(req.body);
        await transport.save();
        responseUtil.success(res, 'Transport created successfully', transport, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

// Get all transports
const getTransports = async (req, res) => {
    try {
        const transports = await Transport.find().populate('organizationId tourId');
        responseUtil.success(res, 'Transports retrieved successfully', transports);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Get transport by ID
const getTransportById = async (req, res) => {
    try {
        const transport = await Transport.findById(req.params.id).populate('organizationId tourId');
        if (!transport) {
            return responseUtil.error(res, 'Transport not found', 404);
        }
        responseUtil.success(res, 'Transport retrieved successfully', transport);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Update transport
const updateTransport = async (req, res) => {
    try {
        const transport = await Transport.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!transport) {
            return responseUtil.error(res, 'Transport not found', 404);
        }
        responseUtil.success(res, 'Transport updated successfully', transport);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

// Delete transport
const deleteTransport = async (req, res) => {
    try {
        const transport = await Transport.findByIdAndDelete(req.params.id);
        if (!transport) {
            return responseUtil.error(res, 'Transport not found', 404);
        }
        responseUtil.success(res, 'Transport deleted successfully');
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Get transports by tour
const getTransportsByTour = async (req, res) => {
    try {
        const transports = await Transport.find({ tourId: req.params.tourId });
        responseUtil.success(res, 'Transports retrieved successfully', transports);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

module.exports = {
    createTransport,
    getTransports,
    getTransportById,
    updateTransport,
    deleteTransport,
    getTransportsByTour
};
