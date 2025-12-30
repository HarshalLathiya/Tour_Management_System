const Tour = require('../models/Tour.model');
const { responseUtil } = require('../utils/response.util');

// Create a new tour
const createTour = async (req, res) => {
    try {
        const tour = new Tour(req.body);
        await tour.save();
        responseUtil.success(res, 'Tour created successfully', tour, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

// Get all tours
const getTours = async (req, res) => {
    try {
        const tours = await Tour.find().populate('organizationId organizerId');
        responseUtil.success(res, 'Tours retrieved successfully', tours);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Get tour by ID
const getTourById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id).populate('organizationId organizerId');
        if (!tour) {
            return responseUtil.error(res, 'Tour not found', 404);
        }
        responseUtil.success(res, 'Tour retrieved successfully', tour);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Update tour
const updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!tour) {
            return responseUtil.error(res, 'Tour not found', 404);
        }
        responseUtil.success(res, 'Tour updated successfully', tour);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

// Delete tour
const deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndDelete(req.params.id);
        if (!tour) {
            return responseUtil.error(res, 'Tour not found', 404);
        }
        responseUtil.success(res, 'Tour deleted successfully');
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Get tours by organization
const getToursByOrganization = async (req, res) => {
    try {
        const tours = await Tour.find({ organizationId: req.params.organizationId });
        responseUtil.success(res, 'Tours retrieved successfully', tours);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

module.exports = {
    createTour,
    getTours,
    getTourById,
    updateTour,
    deleteTour,
    getToursByOrganization
};
