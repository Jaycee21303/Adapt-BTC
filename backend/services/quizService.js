const quizModel = require('../models/quizModel');

const getQuizForLesson = (lessonId) => quizModel.getQuestionsByLesson(lessonId);

const gradeQuiz = async ({ lessonId, answers, userId }) => {
  const questions = await quizModel.getQuestionsByLesson(lessonId);
  if (!questions.length) {
    const error = new Error('No quiz available for this lesson');
    error.status = 404;
    throw error;
  }

  let score = 0;
  const totalQuestions = questions.length;
  const detailed = questions.map((q) => {
    const provided = answers.find((a) => Number(a.questionId) === Number(q.id));
    const isCorrect = provided && provided.answer && provided.answer.toLowerCase().trim() === q.correct_answer.toLowerCase().trim();
    if (isCorrect) score += 1;
    return {
      questionId: q.id,
      correctAnswer: q.correct_answer,
      providedAnswer: provided ? provided.answer : null,
      isCorrect,
    };
  });

  const attempt = await quizModel.saveAttempt({ userId, lessonId, score, totalQuestions });
  return { score, totalQuestions, results: detailed, attempt };
};

const getAttemptsForUser = (userId) => quizModel.getAttemptsByUser(userId);

module.exports = { getQuizForLesson, gradeQuiz, getAttemptsForUser };
