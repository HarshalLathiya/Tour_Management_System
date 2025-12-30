const Participant = require('../models/Participant.model');

class ParticipantService {
    // Create a new participant
    async createParticipant(participantData) {
        try {
            const participant = new Participant(participantData);
            await participant.save();
            return participant;
        } catch (error) {
            throw new Error(`Error creating participant: ${error.message}`);
        }
    }

    // Get all participants
    async getParticipants() {
        try {
            const participants = await Participant.find().populate('tourId userId');
            return participants;
        } catch (error) {
            throw new Error(`Error fetching participants: ${error.message}`);
        }
    }

    // Get participant by ID
    async getParticipantById(id) {
        try {
            const participant = await Participant.findById(id).populate('tourId userId');
            if (!participant) {
                throw new Error('Participant not found');
            }
            return participant;
        } catch (error) {
            throw new Error(`Error fetching participant: ${error.message}`);
        }
    }

    // Update participant
    async updateParticipant(id, updateData) {
        try {
            const participant = await Participant.findByIdAndUpdate(id, updateData, { new: true }).populate('tourId userId');
            if (!participant) {
                throw new Error('Participant not found');
            }
            return participant;
        } catch (error) {
            throw new Error(`Error updating participant: ${error.message}`);
        }
    }

    // Delete participant
    async deleteParticipant(id) {
        try {
            const participant = await Participant.findByIdAndDelete(id);
            if (!participant) {
                throw new Error('Participant not found');
            }
            return participant;
        } catch (error) {
            throw new Error(`Error deleting participant: ${error.message}`);
        }
    }

    // Get participants by tour
    async getParticipantsByTour(tourId) {
        try {
            const participants = await Participant.find({ tourId }).populate('tourId userId');
            return participants;
        } catch (error) {
            throw new Error(`Error fetching participants by tour: ${error.message}`);
        }
    }

    // Get participants by user
    async getParticipantsByUser(userId) {
        try {
            const participants = await Participant.find({ userId }).populate('tourId userId');
            return participants;
        } catch (error) {
            throw new Error(`Error fetching participants by user: ${error.message}`);
        }
    }

    // Check if user is participant in tour
    async isUserParticipantInTour(userId, tourId) {
        try {
            const participant = await Participant.findOne({ userId, tourId });
            return !!participant;
        } catch (error) {
            throw new Error(`Error checking participant status: ${error.message}`);
        }
    }

    // Get participant count for a tour
    async getParticipantCount(tourId) {
        try {
            const count = await Participant.countDocuments({ tourId });
            return count;
        } catch (error) {
            throw new Error(`Error fetching participant count: ${error.message}`);
        }
    }

    // Get participant statistics
    async getParticipantStats(tourId) {
        try {
            const participants = await Participant.find({ tourId });
            const totalParticipants = participants.length;
            const confirmedParticipants = participants.filter(p => p.status === 'confirmed').length;
            const pendingParticipants = participants.filter(p => p.status === 'pending').length;
            const cancelledParticipants = participants.filter(p => p.status === 'cancelled').length;

            return {
                totalParticipants,
                confirmedParticipants,
                pendingParticipants,
                cancelledParticipants
            };
        } catch (error) {
            throw new Error(`Error fetching participant stats: ${error.message}`);
        }
    }
}

module.exports = new ParticipantService();
