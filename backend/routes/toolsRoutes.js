const express = require('express');
const { getLightningToolsData } = require('../controllers/toolsController');

const router = express.Router();

router.get('/tools/lightning', getLightningToolsData);

module.exports = router;
