const courseService = require('../services/courseService');

const getCourses = async (req, res, next) => {
  try {
    const courses = await courseService.listCourses();
    res.json({ success: true, data: courses });
  } catch (err) {
    next(err);
  }
};

const getCourseById = async (req, res, next) => {
  try {
    const course = await courseService.getCourse(Number(req.params.id));
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCourses, getCourseById };
