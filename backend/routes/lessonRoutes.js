const express = require('express');
const lessonController = require('../controllers/lessonController');

const router = express.Router();

router.get('/lessons/:courseId', lessonController.getLessonsByCourse);
router.get('/lesson/:id', lessonController.getLessonById);

module.exports = router;
