const Tour = require('../models/Tour.model');
const { responseUtil } = require('../utils/response.util');

const createTour = async (req, res) => {
    try {
        const tour = new Tour({
            ...req.body,
            organizer: req.user.id
        });
        await tour.save();
        responseUtil.success(res, 'Tour created successfully', tour, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

const getTours = async (req, res) => {
    try {
        const tours = await Tour.find()
            .populate('organization', 'name')
            .populate('organizer', 'firstName lastName email');
        responseUtil.success(res, 'Tours retrieved successfully', tours);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const getTourById = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id)
            .populate('organization', 'name')
            .populate('organizer', 'firstName lastName email');
        if (!tour) {
            return responseUtil.error(res, 'Tour not found', 404);
        }
        responseUtil.success(res, 'Tour retrieved successfully', tour);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!tour) {
            return responseUtil.error(res, 'Tour not found', 404);
        }
        responseUtil.success(res, 'Tour updated successfully', tour);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

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

const getToursByOrganization = async (req, res) => {
    try {
        const tours = await Tour.find({ organization: req.params.organizationId })
            .populate('organizer', 'firstName lastName email');
        responseUtil.success(res, 'Tours retrieved successfully', tours);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const updateTourStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const tour = await Tour.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        if (!tour) {
            return responseUtil.error(res, 'Tour not found', 404);
        }
        responseUtil.success(res, 'Tour status updated successfully', tour);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

module.exports = {
    createTour,
    getTours,
    getTourById,
    updateTour,
    deleteTour,
    getToursByOrganization,
    updateTourStatus
};
