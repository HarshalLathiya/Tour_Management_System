const User = require('../models/User.model');
const { generateToken } = require('../utils/jwt.util');
const { comparePassword, hashPassword } = require('../utils/password.util');

class AuthService {
    // Register a new user
    async register(userData) {
        try {
            const { email, password, name, role, organizationId } = userData;

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('User already exists');
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

            return { user, token };
        } catch (error) {
            throw new Error(`Error registering user: ${error.message}`);
        }
    }

    // Login user
    async login(credentials) {
        try {
            const { email, password } = credentials;

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Check password
            const isPasswordValid = await comparePassword(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }

            // Generate token
            const token = generateToken(user._id);

            return { user, token };
        } catch (error) {
            throw new Error(`Error logging in: ${error.message}`);
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

    // Update user password
    async updatePassword(id, oldPassword, newPassword) {
        try {
            const user = await User.findById(id);
            if (!user) {
                throw new Error('User not found');
            }

            // Check old password
            const isOldPasswordValid = await comparePassword(oldPassword, user.password);
            if (!isOldPasswordValid) {
                throw new Error('Old password is incorrect');
            }

            // Hash new password
            const hashedNewPassword = await hashPassword(newPassword);

            // Update password
            user.password = hashedNewPassword;
            await user.save();

            return user;
        } catch (error) {
            throw new Error(`Error updating password: ${error.message}`);
        }
    }
}

module.exports = new AuthService();
