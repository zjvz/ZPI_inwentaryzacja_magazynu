const router = require('express').Router();
const authMiddleware = require('../config/passport/auth.js');
const wastagesController = require('../controllers/wastages.controller.js');
const dayStatsController = require('../controllers/dayStats.controller.js');

router.get('/info', authMiddleware.ensureAuthenticated, dayStatsController.getStatsDatePage);
router.get('/info/:date', authMiddleware.ensureAuthenticated, dayStatsController.getStatsPage);

/**
 * WASTAGES LIST PAGE
 */
router.get('/add/', authMiddleware.ensureAuthenticated, wastagesController.getAddWastagesDatePage);
router.get('/add/:date/', authMiddleware.ensureAuthenticated, wastagesController.getAddWastagesPage);
router.post('/add/', authMiddleware.ensureAuthenticated, wastagesController.postAddWastages);





module.exports = router;