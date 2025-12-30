const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

const generateToken = (payload, expiresIn = '7d') => {
    return jwt.sign(payload, jwtSecret, { expiresIn });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, jwtSecret);
    } catch (error) {
        return null;
    }
};

const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateToken,
    verifyToken,
    decodeToken
};