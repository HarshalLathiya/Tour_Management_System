const User = require('../models/User.model');
const { responseUtil } = require('../utils/response.util');
const { generateToken } = require('../utils/jwt.util');
const { comparePassword, hashPassword } = require('../utils/password.util');

const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, role, organization } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return responseUtil.error(res, 'User already exists', 400);
        }

        const user = new User({
            email,
            password,
            firstName,
            lastName,
            phone,
            role,
            organization
        });

        await user.save();

        const token = generateToken(user._id);

        const userObj = user.toObject();
        delete userObj.password;

        responseUtil.success(res, 'User registered successfully', { user: userObj, token }, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return responseUtil.error(res, 'Invalid credentials', 401);
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return responseUtil.error(res, 'Invalid credentials', 401);
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id);

        const userObj = user.toObject();
        delete userObj.password;

        responseUtil.success(res, 'Login successful', { user: userObj, token });
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('organization', 'name');
        if (!user) {
            return responseUtil.error(res, 'User not found', 404);
        }
        responseUtil.success(res, 'User retrieved successfully', user);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const logout = async (req, res) => {
    try {
        responseUtil.success(res, 'Logged out successfully');
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id).select('+password');
        
        if (!user) {
            return responseUtil.error(res, 'User not found', 404);
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return responseUtil.error(res, 'Invalid current password', 400);
        }

        user.password = newPassword;
        await user.save();

        responseUtil.success(res, 'Password updated successfully');
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

module.exports = {
    register,
    login,
    getMe,
    logout,
    updatePassword
};
