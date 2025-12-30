const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    logout,
    updatePassword
} = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    registerSchema,
    loginSchema,
    updatePasswordSchema
} = require('../validators/auth.validator');

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Protected routes
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);
router.put('/update-password', protect, validate(updatePasswordSchema), updatePassword);

module.exports = router;