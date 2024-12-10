const router = require('express').Router();
const authMiddleware = require('../config/passport/auth.js');
const supplyController = require('../controllers/supply.controller.js');

/**
 * USERS LIST PAGE
 */
router.get('/info', authMiddleware.ensureAuthenticated, supplyController.getSupplyPageDate);
router.get('/info/:date', authMiddleware.ensureAuthenticated, supplyController.getSupplyPage);
router.post('/info/:date', authMiddleware.ensureAuthenticated, supplyController.getSupplyPagePost);

/**
 * USERS LIST API
 */
router.post('/api/info', authMiddleware.ensureAuthenticated, supplyController.postSupplyApi);
router.post('/api/edit', authMiddleware.ensureAuthenticated, supplyController.postSupplyApiEdit);

module.exports = router;