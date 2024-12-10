const router = require('express').Router();
const authMiddleware = require('../config/passport/auth.js');
const usersController = require('../controllers/users.controller.js');

/**
 * USERS LIST PAGE
 */
router.get('/', authMiddleware.ensureIsKR, usersController.getUsersPage);

/**
 * ADD USER PAGE
 */
router.get('/add', authMiddleware.ensureIsKR, usersController.getAddUser);
router.post('/add', authMiddleware.ensureIsKR, usersController.postAddUser);

/**
 * USERS LIST API
 */
router.get('/api/', authMiddleware.ensureIsKR, usersController.getUsersApi);
router.post('/api/', authMiddleware.ensureIsKR, usersController.postUsersApi);

module.exports = router;