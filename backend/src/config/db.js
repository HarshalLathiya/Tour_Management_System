const mongoose = require('mongoose');
const { logger } = require('./logger');
const { mongodbUri } = require('./env');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongodbUri);
        logger.info(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        logger.error('MongoDB connection failed', {
            message: error.message,
            stack: error.stack
        });
        process.exit(1);
    }
};

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
    logger.error('MongoDB runtime error', { message: err.message });
});

module.exports = connectDB;
