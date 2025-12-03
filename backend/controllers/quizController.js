const quizService = require('../services/quizService');
const validateRequest = require('../middleware/validation');
const { quizSubmissionSchema } = require('../utils/validators');

const getQuiz = async (req, res, next) => {
  try {
    const questions = await quizService.getQuizForLesson(Number(req.params.lessonId));
    res.json({ success: true, data: questions });
  } catch (err) {
    next(err);
  }
};

const submitQuiz = [validateRequest(quizSubmissionSchema), async (req, res, next) => {
  try {
    const payload = req.validated;
    const result = await quizService.gradeQuiz({ lessonId: payload.lessonId, answers: payload.answers, userId: req.user.id });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}];

module.exports = { getQuiz, submitQuiz };
