const Incident = require('../models/Incident.model');

class IncidentService {
    // Create a new incident
    async createIncident(incidentData) {
        try {
            const incident = new Incident(incidentData);
            await incident.save();
            return incident;
        } catch (error) {
            throw new Error(`Error creating incident: ${error.message}`);
        }
    }

    // Get all incidents
    async getIncidents() {
        try {
            const incidents = await Incident.find().populate('tourId reportedBy');
            return incidents;
        } catch (error) {
            throw new Error(`Error fetching incidents: ${error.message}`);
        }
    }

    // Get incident by ID
    async getIncidentById(id) {
        try {
            const incident = await Incident.findById(id).populate('tourId reportedBy');
            if (!incident) {
                throw new Error('Incident not found');
            }
            return incident;
        } catch (error) {
            throw new Error(`Error fetching incident: ${error.message}`);
        }
    }

    // Update incident
    async updateIncident(id, updateData) {
        try {
            const incident = await Incident.findByIdAndUpdate(id, updateData, { new: true }).populate('tourId reportedBy');
            if (!incident) {
                throw new Error('Incident not found');
            }
            return incident;
        } catch (error) {
            throw new Error(`Error updating incident: ${error.message}`);
        }
    }

    // Delete incident
    async deleteIncident(id) {
        try {
            const incident = await Incident.findByIdAndDelete(id);
            if (!incident) {
                throw new Error('Incident not found');
            }
            return incident;
        } catch (error) {
            throw new Error(`Error deleting incident: ${error.message}`);
        }
    }

    // Get incidents by tour
    async getIncidentsByTour(tourId) {
        try {
            const incidents = await Incident.find({ tourId }).populate('tourId reportedBy');
            return incidents;
        } catch (error) {
            throw new Error(`Error fetching incidents by tour: ${error.message}`);
        }
    }

    // Get incidents by status
    async getIncidentsByStatus(status) {
        try {
            const incidents = await Incident.find({ status }).populate('tourId reportedBy');
            return incidents;
        } catch (error) {
            throw new Error(`Error fetching incidents by status: ${error.message}`);
        }
    }

    // Get incident statistics
    async getIncidentStats(tourId) {
        try {
            const incidents = await Incident.find({ tourId });
            const totalIncidents = incidents.length;
            const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;
            const pendingIncidents = incidents.filter(i => i.status === 'pending').length;
            const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;

            return {
                totalIncidents,
                resolvedIncidents,
                pendingIncidents,
                criticalIncidents
            };
        } catch (error) {
            throw new Error(`Error fetching incident stats: ${error.message}`);
        }
    }
}

module.exports = new IncidentService();
