const express = require('express');
const router = express.Router();
const {
    createOrganization,
    getOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization
} = require('../controllers/organization.controller');
const { protect } = require('../middlewares/auth.middleware');
const { roleCheck } = require('../middlewares/role.middleware');

// All routes require authentication
router.use(protect);

// Admin only routes
router.post('/', roleCheck(['admin']), createOrganization);
router.put('/:id', roleCheck(['admin']), updateOrganization);
router.delete('/:id', roleCheck(['admin']), deleteOrganization);

// All authenticated users
router.get('/', getOrganizations);
router.get('/:id', getOrganizationById);

module.exports = router;
