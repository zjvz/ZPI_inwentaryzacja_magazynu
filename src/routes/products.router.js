const router = require('express').Router();
const authMiddleware = require('../config/passport/auth.js');
const productsController = require('../controllers/products.controller.js');

/**
 * PRODUCTS LIST PAGE
 */
router.get('/', authMiddleware.ensureAuthenticated, productsController.getProductsPage);


/**
 * ADD PRODUCT PAGE
 */
router.get('/add', authMiddleware.ensureIsKR, productsController.getAddProductPage);
router.post('/add', authMiddleware.ensureIsKR, productsController.postAddProduct);

/**
 * EDIT PRODUCT PAGE
 */
router.post('/remove', authMiddleware.ensureIsKR, productsController.postRemoveProduct);
router.get('/edit/:name', authMiddleware.ensureIsKR, productsController.getEditProduct);
router.post('/edit', authMiddleware.ensureIsKR, productsController.postEditProduct);

module.exports = router;