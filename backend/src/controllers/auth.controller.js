const User = require('../models/User.model');
const { responseUtil } = require('../utils/response.util');
const { generateToken } = require('../utils/jwt.util');
const { comparePassword, hashPassword } = require('../utils/password.util');

// Register a new user
const register = async (req, res) => {
    try {
        const { email, password, name, role, organizationId } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return responseUtil.error(res, 'User already exists', 400);
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = new User({
            email,
            password: hashedPassword,
            name,
            role,
            organizationId
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        responseUtil.success(res, 'User registered successfully', { user, token }, 201);
    } catch (error) {
        responseUtil.error(res, error.message, 400);
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return responseUtil.error(res, 'Invalid credentials', 401);
        }

        // Check password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return responseUtil.error(res, 'Invalid credentials', 401);
        }

        // Generate token
        const token = generateToken(user._id);

        responseUtil.success(res, 'Login successful', { user, token });
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

// Get current user
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('organizationId');
        if (!user) {
            return responseUtil.error(res, 'User not found', 404);
        }
        responseUtil.success(res, 'User retrieved successfully', user);
    } catch (error) {
        responseUtil.error(res, error.message, 500);
    }
};

module.exports = {
    register,
    login,
    getMe
};
