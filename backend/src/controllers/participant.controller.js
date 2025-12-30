const Participant = require('../models/Participant.model');
const Tour = require('../models/Tour.model');
const { responseUtil } = require('../utils/response.util');

const createParticipant = async (req, res) => {
    try {
        const tour = await Tour.findById(req.body.tour);
        if (!tour) {
            return responseUtil.error(res, 'Tour not found', 404);
        }
        
        if (tour.currentParticipants >= tour.maxParticipants) {
            return responseUtil.error(res, 'Tour is full', 400);
        }

        const participant = new Participant(req.body);
        await participant.save();

        tour.currentParticipants += 1;
        await tour.save();

        responseUtil.success(res, 'Participant registered successfully', participant, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

const getParticipants = async (req, res) => {
    try {
        const participants = await Participant.find()
            .populate('tour', 'name')
            .populate('user', 'firstName lastName email');
        responseUtil.success(res, 'Participants retrieved successfully', participants);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const getParticipantById = async (req, res) => {
    try {
        const participant = await Participant.findById(req.params.id)
            .populate('tour', 'name')
            .populate('user', 'firstName lastName email phone');
        if (!participant) {
            return responseUtil.error(res, 'Participant not found', 404);
        }
        responseUtil.success(res, 'Participant retrieved successfully', participant);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const updateParticipant = async (req, res) => {
    try {
        const participant = await Participant.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!participant) {
            return responseUtil.error(res, 'Participant not found', 404);
        }
        responseUtil.success(res, 'Participant updated successfully', participant);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

const deleteParticipant = async (req, res) => {
    try {
        const participant = await Participant.findById(req.params.id);
        if (!participant) {
            return responseUtil.error(res, 'Participant not found', 404);
        }

        const tour = await Tour.findById(participant.tour);
        if (tour && tour.currentParticipants > 0) {
            tour.currentParticipants -= 1;
            await tour.save();
        }

        await Participant.findByIdAndDelete(req.params.id);
        responseUtil.success(res, 'Participant deleted successfully');
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const getParticipantsByTour = async (req, res) => {
    try {
        const participants = await Participant.find({ tour: req.params.tourId })
            .populate('user', 'firstName lastName email phone');
        responseUtil.success(res, 'Participants retrieved successfully', participants);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const updateParticipantStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const participant = await Participant.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        if (!participant) {
            return responseUtil.error(res, 'Participant not found', 404);
        }
        responseUtil.success(res, 'Participant status updated successfully', participant);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

const updatePaymentStatus = async (req, res) => {
    try {
        const { paymentStatus, amountPaid } = req.body;
        const participant = await Participant.findByIdAndUpdate(
            req.params.id,
            { paymentStatus, amountPaid },
            { new: true, runValidators: true }
        );
        if (!participant) {
            return responseUtil.error(res, 'Participant not found', 404);
        }
        responseUtil.success(res, 'Payment status updated successfully', participant);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

module.exports = {
    createParticipant,
    getParticipants,
    getParticipantById,
    updateParticipant,
    deleteParticipant,
    getParticipantsByTour,
    updateParticipantStatus,
    updatePaymentStatus
};
