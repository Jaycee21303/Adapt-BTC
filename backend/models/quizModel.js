const db = require('../config/db');

const getQuestionsByLesson = async (lessonId) => {
  const result = await db.query('SELECT * FROM quiz_questions WHERE lesson_id = $1', [lessonId]);
  return result.rows;
};

const saveAttempt = async ({ userId, lessonId, score, totalQuestions }) => {
  const result = await db.query(
    `INSERT INTO quiz_attempts (user_id, lesson_id, score, total_questions)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, lesson_id, score, total_questions, submitted_at`,
    [userId, lessonId, score, totalQuestions]
  );
  return result.rows[0];
};

const getAttemptsByUser = async (userId) => {
  const result = await db.query(
    `SELECT qa.*, l.course_id
     FROM quiz_attempts qa
     JOIN lessons l ON qa.lesson_id = l.id
     WHERE qa.user_id = $1
     ORDER BY qa.submitted_at DESC`,
    [userId]
  );
  return result.rows;
};

module.exports = { getQuestionsByLesson, saveAttempt, getAttemptsByUser };
