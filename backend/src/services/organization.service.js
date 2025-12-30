const Organization = require('../models/Organization.model');

class OrganizationService {
    // Create a new organization
    async createOrganization(orgData) {
        try {
            const organization = new Organization(orgData);
            await organization.save();
            return organization;
        } catch (error) {
            throw new Error(`Error creating organization: ${error.message}`);
        }
    }

    // Get all organizations
    async getOrganizations() {
        try {
            const organizations = await Organization.find();
            return organizations;
        } catch (error) {
            throw new Error(`Error fetching organizations: ${error.message}`);
        }
    }

    // Get organization by ID
    async getOrganizationById(id) {
        try {
            const organization = await Organization.findById(id);
            if (!organization) {
                throw new Error('Organization not found');
            }
            return organization;
        } catch (error) {
            throw new Error(`Error fetching organization: ${error.message}`);
        }
    }

    // Update organization
    async updateOrganization(id, updateData) {
        try {
            const organization = await Organization.findByIdAndUpdate(id, updateData, { new: true });
            if (!organization) {
                throw new Error('Organization not found');
            }
            return organization;
        } catch (error) {
            throw new Error(`Error updating organization: ${error.message}`);
        }
    }

    // Delete organization
    async deleteOrganization(id) {
        try {
            const organization = await Organization.findByIdAndDelete(id);
            if (!organization) {
                throw new Error('Organization not found');
            }
            return organization;
        } catch (error) {
            throw new Error(`Error deleting organization: ${error.message}`);
        }
    }

    // Get organization statistics
    async getOrganizationStats(id) {
        try {
            const organization = await Organization.findById(id);
            if (!organization) {
                throw new Error('Organization not found');
            }

            // Get counts of related entities
            const Tour = require('../models/Tour.model');
            const User = require('../models/User.model');

            const tourCount = await Tour.countDocuments({ organizationId: id });
            const userCount = await User.countDocuments({ organizationId: id });

            return {
                organization,
                stats: {
                    totalTours: tourCount,
                    totalUsers: userCount
                }
            };
        } catch (error) {
            throw new Error(`Error fetching organization stats: ${error.message}`);
        }
    }
}

module.exports = new OrganizationService();
