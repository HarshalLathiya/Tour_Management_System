require('dotenv').config({ path: '../backend/.env' });
const mongoose = require('mongoose');
const User = require('../backend/src/models/User.model');
const { connectDB } = require('../backend/src/config/db');
const { logger } = require('../backend/src/config/logger');
const { defaultAdminEmail, defaultAdminPassword } = require('../backend/src/config/env');
i
const seedAdmin = async () => {
    try {
        await connectDB();

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: defaultAdminEmail });
        if (existingAdmin) {
            // Update password if it existsn ba
            existingAdmin.password = defaultAdminPassword;
            await existingAdmin.save();
            logger.info('Default admin user password updated');
            process.exit(0);
        }

        // Create default admin user
        const admin = await User.create({
            firstName: 'Admin',
            lastName: 'User',
            email: defaultAdminEmail,
            password: defaultAdminPassword,
            phone: '1234567890',
            role: 'admin',
            isActive: true
        });

        logger.info(`Default admin user created: ${admin.email}`);
        process.exit(0);
    } catch (error) {
        logger.error(`Seeding error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
