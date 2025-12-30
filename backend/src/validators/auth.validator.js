const Joi = require('joi');

const registerSchema = Joi.object({
    firstName: Joi.string().required().min(2).max(50),
    lastName: Joi.string().required().min(2).max(50),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(30),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/),
    role: Joi.string().valid('admin', 'organizer', 'participant')
});

const loginSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required()
});

const updatePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(6).max(30)
});

module.exports = {
    registerSchema,
    loginSchema,
    updatePasswordSchema
};