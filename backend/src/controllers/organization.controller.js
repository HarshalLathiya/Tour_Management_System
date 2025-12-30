const Organization = require('../models/Organization.model');
const { responseUtil } = require('../utils/response.util');

// Create a new organization
const createOrganization = async (req, res) => {
    try {
        const organization = new Organization(req.body);
        await organization.save();
        responseUtil.success(res, 'Organization created successfully', organization, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

// Get all organizations
const getOrganizations = async (req, res) => {
    try {
        const organizations = await Organization.find().populate('createdBy');
        responseUtil.success(res, 'Organizations retrieved successfully', organizations);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Get organization by ID
const getOrganizationById = async (req, res) => {
    try {
        const organization = await Organization.findById(req.params.id).populate('createdBy');
        if (!organization) {
            return responseUtil.error(res, 'Organization not found', 404);
        }
        responseUtil.success(res, 'Organization retrieved successfully', organization);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Update organization
const updateOrganization = async (req, res) => {
    try {
        const organization = await Organization.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!organization) {
            return responseUtil.error(res, 'Organization not found', 404);
        }
        responseUtil.success(res, 'Organization updated successfully', organization);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

// Delete organization
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

module.exports = {
    createOrganization,
    getOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization
};
