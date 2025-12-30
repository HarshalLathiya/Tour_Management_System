const User = require('../models/User.model');

class UserService {
    // Create a new user
    async createUser(userData) {
        try {
            const user = new User(userData);
            await user.save();
            return user;
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    // Get all users
    async getUsers() {
        try {
            const users = await User.find().populate('organizationId');
            return users;
        } catch (error) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    // Get user by ID
    async getUserById(id) {
        try {
            const user = await User.findById(id).populate('organizationId');
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(`Error fetching user: ${error.message}`);
        }
    }

    // Update user
    async updateUser(id, updateData) {
        try {
            const user = await User.findByIdAndUpdate(id, updateData, { new: true }).populate('organizationId');
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    // Delete user
    async deleteUser(id) {
        try {
            const user = await User.findByIdAndDelete(id);
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    // Get users by organization
    async getUsersByOrganization(organizationId) {
        try {
            const users = await User.find({ organizationId }).populate('organizationId');
            return users;
        } catch (error) {
            throw new Error(`Error fetching users by organization: ${error.message}`);
        }
    }

    // Update user password
    async updatePassword(id, newPassword) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw new Error('User not found');
            }

            user.password = newPassword; // Assuming password is already hashed
            await user.save();

            return user;
        } catch (error) {
            throw new Error(`Error updating password: ${error.message}`);
        }
    }

    // Get user statistics
    async getUserStats(id) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw new Error('User not found');
            }

            // Get counts of related entities based on role
            let stats = {};

            if (user.role === 'organizer') {
                const Tour = require('../models/Tour.model');
                const tourCount = await Tour.countDocuments({ organizationId: user.organizationId });
                stats = { totalTours: tourCount };
            } else if (user.role === 'participant') {
                const Participant = require('../models/Participant.model');
                const participantCount = await Participant.countDocuments({ userId: id });
                stats = { totalParticipations: participantCount };
            }

            return {
                user,
                stats
            };
        } catch (error) {
            throw new Error(`Error fetching user stats: ${error.message}`);
        }
    }
}

module.exports = new UserService();
