const express = require('express');
const router = express.Router();
const {
    getTourReport,
    getOrganizationReport
} = require('../controllers/report.controller');
const { protect } = require('../middlewares/auth.middleware');
const { roleCheck } = require('../middlewares/role.middleware');

// All routes require authentication
router.use(protect);

// Admin and organizer routes
router.get('/tour/:tourId', roleCheck(['admin', 'organizer']), getTourReport);
router.get('/organization/:organizationId', roleCheck(['admin']), getOrganizationReport);

module.exports = router;
