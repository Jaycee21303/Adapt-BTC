const courseModel = require('../models/courseModel');
const lessonModel = require('../models/lessonModel');

const listCourses = () => courseModel.getCourses();
const getCourse = (id) => courseModel.getCourseById(id);
const getLessons = (courseId) => lessonModel.getLessonsByCourse(courseId);
const getLesson = (lessonId) => lessonModel.getLessonById(lessonId);

module.exports = { listCourses, getCourse, getLessons, getLesson };
