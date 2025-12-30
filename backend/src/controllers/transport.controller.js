const Transport = require('../models/Transport.model');
const { responseUtil } = require('../utils/response.util');

const createTransport = async (req, res) => {
    try {
        const transport = new Transport(req.body);
        await transport.save();
        responseUtil.success(res, 'Transport created successfully', transport, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

const getTransports = async (req, res) => {
    try {
        const transports = await Transport.find().populate('tour', 'name');
        responseUtil.success(res, 'Transports retrieved successfully', transports);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const getTransportById = async (req, res) => {
    try {
        const transport = await Transport.findById(req.params.id).populate('tour', 'name');
        if (!transport) {
            return responseUtil.error(res, 'Transport not found', 404);
        }
        responseUtil.success(res, 'Transport retrieved successfully', transport);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const updateTransport = async (req, res) => {
    try {
        const transport = await Transport.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!transport) {
            return responseUtil.error(res, 'Transport not found', 404);
        }
        responseUtil.success(res, 'Transport updated successfully', transport);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

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

const getTransportsByTour = async (req, res) => {
    try {
        const transports = await Transport.find({ tour: req.params.tourId });
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
