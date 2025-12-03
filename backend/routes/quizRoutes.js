const express = require('express');
const quizController = require('../controllers/quizController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/quiz/:lessonId', authMiddleware, quizController.getQuiz);
router.post('/quiz/submit', authMiddleware, quizController.submitQuiz);

module.exports = router;
