const db = require('../config/db');

const getCourses = async () => {
  const result = await db.query(
    `SELECT c.*, COUNT(l.id) AS lesson_count
     FROM courses c
     LEFT JOIN lessons l ON l.course_id = c.id
     GROUP BY c.id
     ORDER BY c.id`
  );
  return result.rows;
};

const getCourseById = async (id) => {
  const result = await db.query('SELECT * FROM courses WHERE id = $1', [id]);
  return result.rows[0];
};

module.exports = { getCourses, getCourseById };
