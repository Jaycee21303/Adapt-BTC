const courseService = require('../services/courseService');

const getLessonsByCourse = async (req, res, next) => {
  try {
    const lessons = await courseService.getLessons(Number(req.params.courseId));
    res.json({ success: true, data: lessons });
  } catch (err) {
    next(err);
  }
};

const getLessonById = async (req, res, next) => {
  try {
    const lesson = await courseService.getLesson(Number(req.params.id));
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.json({ success: true, data: lesson });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLessonsByCourse, getLessonById };
