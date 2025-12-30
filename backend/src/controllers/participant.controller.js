const Participant = require('../models/Participant.model');
const { responseUtil } = require('../utils/response.util');

// Create a new participant
const createParticipant = async (req, res) => {
    try {
        const participant = new Participant(req.body);
        await participant.save();
        responseUtil.success(res, 'Participant created successfully', participant, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

// Get all participants
const getParticipants = async (req, res) => {
    try {
        const participants = await Participant.find().populate('tourId userId');
        responseUtil.success(res, 'Participants retrieved successfully', participants);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Get participant by ID
const getParticipantById = async (req, res) => {
    try {
        const participant = await Participant.findById(req.params.id).populate('tourId userId');
        if (!participant) {
            return responseUtil.error(res, 'Participant not found', 404);
        }
        responseUtil.success(res, 'Participant retrieved successfully', participant);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Update participant
const updateParticipant = async (req, res) => {
    try {
        const participant = await Participant.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!participant) {
            return responseUtil.error(res, 'Participant not found', 404);
        }
        responseUtil.success(res, 'Participant updated successfully', participant);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

// Delete participant
const deleteParticipant = async (req, res) => {
    try {
        const participant = await Participant.findByIdAndDelete(req.params.id);
        if (!participant) {
            return responseUtil.error(res, 'Participant not found', 404);
        }
        responseUtil.success(res, 'Participant deleted successfully');
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Get participants by tour
const getParticipantsByTour = async (req, res) => {
    try {
        const participants = await Participant.find({ tourId: req.params.tourId });
        responseUtil.success(res, 'Participants retrieved successfully', participants);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

module.exports = {
    createParticipant,
    getParticipants,
    getParticipantById,
    updateParticipant,
    deleteParticipant,
    getParticipantsByTour
};
