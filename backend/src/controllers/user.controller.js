const User = require('../models/User.model');
const { responseUtil } = require('../utils/response.util');

const createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const userObj = user.toObject();
        delete userObj.password;
        responseUtil.success(res, 'User created successfully', userObj, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find().populate('organization', 'name');
        responseUtil.success(res, 'Users retrieved successfully', users);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('organization', 'name');
        if (!user) {
            return responseUtil.error(res, 'User not found', 404);
        }
        responseUtil.success(res, 'User retrieved successfully', user);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const updateUser = async (req, res) => {
    try {
        const updateData = { ...req.body };
        delete updateData.password;
        
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        );
        if (!user) {
            return responseUtil.error(res, 'User not found', 404);
        }
        responseUtil.success(res, 'User updated successfully', user);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

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

const getUsersByOrganization = async (req, res) => {
    try {
        const users = await User.find({ organization: req.params.organizationId });
        responseUtil.success(res, 'Users retrieved successfully', users);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        );
        if (!user) {
            return responseUtil.error(res, 'User not found', 404);
        }
        responseUtil.success(res, 'User role updated successfully', user);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return responseUtil.error(res, 'User not found', 404);
        }
        
        user.isActive = !user.isActive;
        await user.save();
        
        responseUtil.success(res, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, user);
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
    getUsersByOrganization,
    updateUserRole,
    toggleUserStatus
};
