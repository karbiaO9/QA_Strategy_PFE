const express = require('express');
const router = express.Router();

// Import route modules
const healthRoutes = require('./health');
const cacheRoutes = require('./cache');
const apiRoutes = require('./api');

// Mount routes
router.use('/', healthRoutes);
router.use('/cache', cacheRoutes);
router.use('/api', apiRoutes);

module.exports = router;
