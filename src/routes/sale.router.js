const router = require('express').Router();
const authMiddleware = require('../config/passport/auth.js');
const saleController = require('../controllers/sale.controller.js');

/**
 * sale LIST PAGE
 */
router.get('/add', authMiddleware.ensureAuthenticated, saleController.getAddSaleDatePage);
router.get('/add/:date', authMiddleware.ensureAuthenticated, saleController.getAddSalePage);
router.post('/add', authMiddleware.ensureAuthenticated, saleController.postAddSale);

module.exports = router;