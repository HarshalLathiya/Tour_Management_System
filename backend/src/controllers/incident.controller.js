const Incident = require('../models/Incident.model');
const { responseUtil } = require('../utils/response.util');

const createIncident = async (req, res) => {
    try {
        const incident = new Incident({
            ...req.body,
            reportedBy: req.user.id
        });
        await incident.save();
        responseUtil.success(res, 'Incident created successfully', incident, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

const getIncidents = async (req, res) => {
    try {
        const incidents = await Incident.find()
            .populate('tour', 'name')
            .populate('reportedBy', 'firstName lastName email')
            .populate('resolvedBy', 'firstName lastName');
        responseUtil.success(res, 'Incidents retrieved successfully', incidents);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const getIncidentById = async (req, res) => {
    try {
        const incident = await Incident.findById(req.params.id)
            .populate('tour', 'name')
            .populate('reportedBy', 'firstName lastName email')
            .populate('resolvedBy', 'firstName lastName');
        if (!incident) {
            return responseUtil.error(res, 'Incident not found', 404);
        }
        responseUtil.success(res, 'Incident retrieved successfully', incident);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const updateIncident = async (req, res) => {
    try {
        const incident = await Incident.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!incident) {
            return responseUtil.error(res, 'Incident not found', 404);
        }
        responseUtil.success(res, 'Incident updated successfully', incident);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

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

const getIncidentsByTour = async (req, res) => {
    try {
        const incidents = await Incident.find({ tour: req.params.tourId })
            .populate('reportedBy', 'firstName lastName email')
            .populate('resolvedBy', 'firstName lastName');
        responseUtil.success(res, 'Incidents retrieved successfully', incidents);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const resolveIncident = async (req, res) => {
    try {
        const incident = await Incident.findByIdAndUpdate(
            req.params.id,
            {
                status: 'resolved',
                resolution: req.body.resolution,
                resolvedBy: req.user.id,
                resolvedAt: new Date()
            },
            { new: true }
        );
        if (!incident) {
            return responseUtil.error(res, 'Incident not found', 404);
        }
        responseUtil.success(res, 'Incident resolved successfully', incident);
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
    getIncidentsByTour,
    resolveIncident
};
