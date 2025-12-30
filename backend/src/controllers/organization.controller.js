const Organization = require('../models/Organization.model');
const { responseUtil } = require('../utils/response.util');

const createOrganization = async (req, res) => {
    try {
        const organization = new Organization({
            ...req.body,
            createdBy: req.user.id
        });
        await organization.save();
        responseUtil.success(res, 'Organization created successfully', organization, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

const getOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find()
            .populate('createdBy', 'firstName lastName email');
        responseUtil.success(res, 'Organizations retrieved successfully', organizations);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const getOrganizationById = async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id)
            .populate('createdBy', 'firstName lastName email')
            .populate('members.user', 'firstName lastName email');
        if (!organization) {
            return responseUtil.error(res, 'Organization not found', 404);
        }
        responseUtil.success(res, 'Organization retrieved successfully', organization);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const updateOrganization = async (req, res) => {
    try {
        const organization = await Organization.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!organization) {
            return responseUtil.error(res, 'Organization not found', 404);
        }
        responseUtil.success(res, 'Organization updated successfully', organization);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

const deleteOrganization = async (req, res) => {
    try {
        const organization = await Organization.findByIdAndDelete(req.params.id);
        if (!organization) {
            return responseUtil.error(res, 'Organization not found', 404);
        }
        responseUtil.success(res, 'Organization deleted successfully');
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const addMember = async (req, res) => {
    try {
        const { userId, role } = req.body;
        const organization = await Organization.findById(req.params.id);
        
        if (!organization) {
            return responseUtil.error(res, 'Organization not found', 404);
        }

        const existingMember = organization.members.find(
            m => m.user.toString() === userId
        );
        if (existingMember) {
            return responseUtil.error(res, 'User is already a member', 400);
        }

        organization.members.push({ user: userId, role: role || 'member' });
        await organization.save();
        
        responseUtil.success(res, 'Member added successfully', organization);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const removeMember = async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id);
        
        if (!organization) {
            return responseUtil.error(res, 'Organization not found', 404);
        }

        organization.members = organization.members.filter(
            m => m.user.toString() !== req.params.userId
        );
        await organization.save();
        
        responseUtil.success(res, 'Member removed successfully', organization);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

module.exports = {
    createOrganization,
    getOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization,
    addMember,
    removeMember
};
