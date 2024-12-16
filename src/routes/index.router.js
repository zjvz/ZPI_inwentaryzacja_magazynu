const router = require('express').Router();
const indexController = require('../controllers/index.controller.js');
const authMiddleware = require('../config/passport/auth.js');

/**
 * INDEX PAGE
 */
router.get('/', authMiddleware.ensureAuthenticated, indexController.getIndex);


module.exports = router;