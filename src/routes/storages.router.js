const router = require('express').Router();
const authMiddleware = require('../config/passport/auth.js');
const storagesController = require('../controllers/storages.controller.js');
const invController = require('../controllers/inventorization.controller.js');

/**
 * STORAGES LIST PAGE
 */
router.get('/', authMiddleware.ensureAuthenticated, storagesController.getStoragesPage);

/**
 * ADD STORAGE PAGE
 */
router.get('/add', authMiddleware.ensureIsKR, storagesController.getAddStoragePage);
router.post('/add', authMiddleware.ensureIsKR, storagesController.postAddStorage);
router.post('/edit', authMiddleware.ensureIsKR, storagesController.postEditStorage);

/**
 * ADD INVINFO PAGE
 */
router.get('/inv/add', authMiddleware.ensureAuthenticated, invController.getAddInvDatePage);
router.get('/inv/add/:date', authMiddleware.ensureAuthenticated, invController.getAddInvPage);
router.post('/inv/add', authMiddleware.ensureAuthenticated, invController.postAddInv);

module.exports = router;