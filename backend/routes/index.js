const express = require('express');
const authRoutes = require('./authRoutes');
const courseRoutes = require('./courseRoutes');
const lessonRoutes = require('./lessonRoutes');
const quizRoutes = require('./quizRoutes');
const certificateRoutes = require('./certificateRoutes');
const userRoutes = require('./userRoutes');
const toolsRoutes = require('./toolsRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/', lessonRoutes);
router.use('/', quizRoutes);
router.use('/', certificateRoutes);
router.use('/', userRoutes);
router.use('/', toolsRoutes);

module.exports = router;
