const Incident = require('../models/Incident.model');
const { responseUtil } = require('../utils/response.util');

// Create a new incident
const createIncident = async (req, res) => {
    try {
        const incident = new Incident(req.body);
        await incident.save();
        responseUtil.success(res, 'Incident created successfully', incident, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

// Get all incidents
const getIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find().populate('organizationId tourId reportedBy');
        responseUtil.success(res, 'Incidents retrieved successfully', incidents);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Get incident by ID
const getIncidentById = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id).populate('organizationId tourId reportedBy');
        if (!incident) {
            return responseUtil.error(res, 'Incident not found', 404);
        }
        responseUtil.success(res, 'Incident retrieved successfully', incident);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Update incident
const updateIncident = async (req, res) => {
    try {
        const incident = await Incident.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!incident) {
            return responseUtil.error(res, 'Incident not found', 404);
        }
        responseUtil.success(res, 'Incident updated successfully', incident);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

// Delete incident
const deleteIncident = async (req, res) => {
    try {
        const incident = await Incident.findByIdAndDelete(req.params.id);
        if (!incident) {
            return responseUtil.error(res, 'Incident not found', 404);
        }
        responseUtil.success(res, 'Incident deleted successfully');
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Get incidents by tour
const getIncidentsByTour = async (req, res) => {
    try {
        const incidents = await Incident.find({ tourId: req.params.tourId });
        responseUtil.success(res, 'Incidents retrieved successfully', incidents);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

module.exports = {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncident,
    deleteIncident,
    getIncidentsByTour
};
