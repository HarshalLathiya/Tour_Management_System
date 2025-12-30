const Accommodation = require('../models/Accommodation.model');
const { responseUtil } = require('../utils/response.util');

const createAccommodation = async (req, res) => {
    try {
        const accommodation = new Accommodation(req.body);
        await accommodation.save();
        responseUtil.success(res, 'Accommodation created successfully', accommodation, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

const getAccommodations = async (req, res) => {
    try {
        const accommodations = await Accommodation.find().populate('tour', 'name');
        responseUtil.success(res, 'Accommodations retrieved successfully', accommodations);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const getAccommodationById = async (req, res) => {
    try {
        const accommodation = await Accommodation.findById(req.params.id).populate('tour', 'name');
        if (!accommodation) {
            return responseUtil.error(res, 'Accommodation not found', 404);
        }
        responseUtil.success(res, 'Accommodation retrieved successfully', accommodation);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const updateAccommodation = async (req, res) => {
    try {
        const accommodation = await Accommodation.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!accommodation) {
            return responseUtil.error(res, 'Accommodation not found', 404);
        }
        responseUtil.success(res, 'Accommodation updated successfully', accommodation);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

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

const getAccommodationsByTour = async (req, res) => {
    try {
        const accommodations = await Accommodation.find({ tour: req.params.tourId });
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
