const db = require('../config/db');

const getLessonsByCourse = async (courseId) => {
  const result = await db.query(
    'SELECT * FROM lessons WHERE course_id = $1 ORDER BY sequence',
    [courseId]
  );
  return result.rows;
};

const getLessonById = async (id) => {
  const result = await db.query('SELECT * FROM lessons WHERE id = $1', [id]);
  return result.rows[0];
};

module.exports = { getLessonsByCourse, getLessonById };
