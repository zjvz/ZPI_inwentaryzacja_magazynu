const router = require('express').Router();
const authMiddleware = require('../config/passport/auth.js');
const accountController = require('../controllers/account.controller.js');

/**
 * LOGIN PAGE
 */
router.get('/login', authMiddleware.forwardAuthenticated, accountController.getLoginPage);
router.post('/login', authMiddleware.forwardAuthenticated, accountController.postLoginPage);


/**
 * PROFILE PAGE
 */
router.get('/profile', authMiddleware.ensureAuthenticated, accountController.getProfilePage);


/**
 * PASSWORD CHANGE/RESET PAGES
 */
router.get('/reset', authMiddleware.ensureAuthenticated, accountController.getPasswdResetPage);
router.post('/reset', authMiddleware.ensureAuthenticated, accountController.postPasswdResetPage);

router.get('/change', authMiddleware.ensureAuthenticated, accountController.getPasswdChangePage);
router.post('/change', authMiddleware.ensureAuthenticated, accountController.postPasswdChangePage);


/**
 * LOGOUT PAGE
 */
router.get('/logout', authMiddleware.ensureAuthenticated, accountController.getLogout);


module.exports = router;