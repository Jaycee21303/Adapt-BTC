const db = require('../config/db');

const createCertificate = async ({ userId, courseId, verificationCode, documentPath }) => {
  const result = await db.query(
    `INSERT INTO certificates (user_id, course_id, verification_code, document_path)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, course_id, verification_code, document_path, issued_at`,
    [userId, courseId, verificationCode, documentPath]
  );
  return result.rows[0];
};

const getCertificatesByUser = async (userId) => {
  const result = await db.query(
    `SELECT c.*, co.title as course_title
     FROM certificates c
     JOIN courses co ON c.course_id = co.id
     WHERE c.user_id = $1
     ORDER BY issued_at DESC`,
    [userId]
  );
  return result.rows;
};

module.exports = { createCertificate, getCertificatesByUser };
