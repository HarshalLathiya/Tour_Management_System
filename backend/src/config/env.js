const dotenv = require('dotenv');

dotenv.config();

const required = (key) => {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return process.env[key];
};

module.exports = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',

    mongodbUri:
        process.env.NODE_ENV === 'production'
            ? required('MONGODB_URI')
            : process.env.MONGODB_URI || 'mongodb://localhost:27017/tour_management',

    jwtSecret: required('JWT_SECRET'),
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    jwtCookieExpire: Number(process.env.JWT_COOKIE_EXPIRE) || 7,

    bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,

    defaultAdminEmail: process.env.DEFAULT_ADMIN_EMAIL,
    defaultAdminPassword: process.env.DEFAULT_ADMIN_PASSWORD,

    maxFileSize: process.env.MAX_FILE_SIZE || '5mb',
    maxFiles: Number(process.env.MAX_FILES) || 5,

    allowedFileTypes: (
        process.env.ALLOWED_FILE_TYPES ||
        'image/jpeg,image/png,image/jpg,application/pdf'
    ).split(',')
};
