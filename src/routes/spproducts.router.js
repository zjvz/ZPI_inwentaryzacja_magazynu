const router = require('express').Router();
const authMiddleware = require('../config/passport/auth.js');
const spproductsController = require('../controllers/spproducts.controller.js');

/**
 * SPPRODUCTS LIST PAGE
 */
router.get('/', authMiddleware.ensureAuthenticated, spproductsController.getProductsPage);
router.get('/api', authMiddleware.ensureAuthenticated, spproductsController.getProductsAPI);
router.post('/api', authMiddleware.ensureIsKR, spproductsController.postEditProduct);

/**
 * ADD SPPRODUCT PAGE
 */
router.get('/add', authMiddleware.ensureIsKR, spproductsController.getAddProductPage);
router.post('/add', authMiddleware.ensureIsKR, spproductsController.postAddProduct);

module.exports = router;