const Accommodation = require('../models/Accommodation.model');
const { responseUtil } = require('../utils/response.util');

// Create a new accommodation
const createAccommodation = async (req, res) => {
    try {
        const accommodation = new Accommodation(req.body);
        await accommodation.save();
        responseUtil.success(res, 'Accommodation created successfully', accommodation, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

// Get all accommodations
const getAccommodations = async (req, res) => {
    try {
        const accommodations = await Accommodation.find().populate('organizationId tourId');
        responseUtil.success(res, 'Accommodations retrieved successfully', accommodations);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Get accommodation by ID
const getAccommodationById = async (req, res) => {
    try {
        const accommodation = await Accommodation.findById(req.params.id).populate('organizationId tourId');
        if (!accommodation) {
            return responseUtil.error(res, 'Accommodation not found', 404);
        }
        responseUtil.success(res, 'Accommodation retrieved successfully', accommodation);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Update accommodation
const updateAccommodation = async (req, res) => {
    try {
        const accommodation = await Accommodation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!accommodation) {
            return responseUtil.error(res, 'Accommodation not found', 404);
        }
        responseUtil.success(res, 'Accommodation updated successfully', accommodation);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

// Delete accommodation
const deleteAccommodation = async (req, res) => {
    try {
        const accommodation = await Accommodation.findByIdAndDelete(req.params.id);
        if (!accommodation) {
            return responseUtil.error(res, 'Accommodation not found', 404);
        }
        responseUtil.success(res, 'Accommodation deleted successfully');
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Get accommodations by tour
const getAccommodationsByTour = async (req, res) => {
    try {
        const accommodations = await Accommodation.find({ tourId: req.params.tourId });
        responseUtil.success(res, 'Accommodations retrieved successfully', accommodations);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

module.exports = {
    createAccommodation,
    getAccommodations,
    getAccommodationById,
    updateAccommodation,
    deleteAccommodation,
    getAccommodationsByTour
};
