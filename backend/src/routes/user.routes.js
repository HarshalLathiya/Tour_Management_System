const express = require('express');
const router = express.Router();
const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUsersByOrganization
} = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { roleCheck } = require('../middlewares/role.middleware');

// All routes require authentication
router.use(protect);

// Admin only routes
router.post('/', roleCheck(['admin']), createUser);
router.put('/:id', roleCheck(['admin']), updateUser);
router.delete('/:id', roleCheck(['admin']), deleteUser);

// All authenticated users
router.get('/', getUsers);
router.get('/:id', getUserById);
router.get('/organization/:organizationId', getUsersByOrganization);

module.exports = router;
