const userModel = require('../models/userModel');
const courseService = require('./courseService');
const quizService = require('./quizService');
const certificateModel = require('../models/certificateModel');

const getProfile = (userId) => userModel.findById(userId);

const getProgress = async (userId) => {
  const courses = await courseService.listCourses();
  const attempts = await quizService.getAttemptsForUser(userId);

  const progress = await Promise.all(
    courses.map(async (course) => {
      const lessons = await courseService.getLessons(course.id);
      const completedLessons = lessons.filter((lesson) =>
        attempts.some((attempt) => attempt.lesson_id === lesson.id && attempt.score > 0)
      ).length;
      const totalLessons = lessons.length;
      const percent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
      return {
        courseId: course.id,
        courseTitle: course.title,
        progress: percent,
        completedLessons,
        totalLessons,
      };
    })
  );

  return progress;
};

const getCertificates = (userId) => certificateModel.getCertificatesByUser(userId);

const getActivity = async (userId) => {
  const attempts = await quizService.getAttemptsForUser(userId);
  const certificates = await certificateModel.getCertificatesByUser(userId);
  return { attempts, certificates };
};

module.exports = { getProfile, getProgress, getCertificates, getActivity };
