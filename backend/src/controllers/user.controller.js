const User = require('../models/User.model');
const { responseUtil } = require('../utils/response.util');

// Create a new user
const createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        responseUtil.success(res, 'User created successfully', user, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

// Get all users
const getUsers = async (req, res) => {
    try {
        const users = await User.find().populate('organizationId');
        responseUtil.success(res, 'Users retrieved successfully', users);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('organizationId');
        if (!user) {
            return responseUtil.error(res, 'User not found', 404);
        }
        responseUtil.success(res, 'User retrieved successfully', user);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!user) {
            return responseUtil.error(res, 'User not found', 404);
        }
        responseUtil.success(res, 'User updated successfully', user);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return responseUtil.error(res, 'User not found', 404);
        }
        responseUtil.success(res, 'User deleted successfully');
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Get users by organization
const getUsersByOrganization = async (req, res) => {
    try {
        const users = await User.find({ organizationId: req.params.organizationId });
        responseUtil.success(res, 'Users retrieved successfully', users);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUsersByOrganization
};
