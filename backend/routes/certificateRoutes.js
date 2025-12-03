const express = require('express');
const certificateController = require('../controllers/certificateController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/certificate/generate', authMiddleware, certificateController.generateCertificate);

module.exports = router;
