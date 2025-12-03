const { generateCertificate } = require('../utils/pdf');
const certificateModel = require('../models/certificateModel');
const courseService = require('./courseService');
const quizService = require('./quizService');
const userModel = require('../models/userModel');

const generateForUser = async ({ userId, courseId }) => {
  const course = await courseService.getCourse(courseId);
  const user = await userModel.findById(userId);
  if (!course || !user) {
    const error = new Error('Unable to generate certificate for this course');
    error.status = 404;
    throw error;
  }

  const attempts = await quizService.getAttemptsForUser(userId);
  const courseLessons = await courseService.getLessons(courseId);
  const completedLessons = courseLessons.filter((lesson) =>
    attempts.some((attempt) => attempt.lesson_id === lesson.id && attempt.score > 0)
  );
  if (!completedLessons.length) {
    const error = new Error('Complete at least one lesson quiz before requesting a certificate');
    error.status = 400;
    throw error;
  }

  const { verificationCode, filePath, fileName } = await generateCertificate({
    userName: user.name,
    courseName: course.title,
  });

  const record = await certificateModel.createCertificate({
    userId,
    courseId,
    verificationCode,
    documentPath: fileName,
  });

  return { record, downloadPath: `/certificates/${fileName}` };
};

module.exports = { generateForUser };
