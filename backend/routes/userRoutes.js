const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/user/profile', authMiddleware, userController.getProfile);
router.get('/user/progress', authMiddleware, userController.getProgress);
router.get('/user/certificates', authMiddleware, userController.getCertificates);
router.get('/user/activity', authMiddleware, userController.getActivity);

module.exports = router;
