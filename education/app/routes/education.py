from flask import Blueprint, render_template, request, redirect, url_for

from education.app.services import content_loader, grading, cert_generator

education_bp = Blueprint('education', __name__, template_folder='../../templates')


@education_bp.route('/')
def catalog():
    courses = content_loader.get_all_courses()
    return render_template('education/catalog.html', courses=courses)


@education_bp.route('/level/<int:level>')
def level(level):
    courses = content_loader.get_courses_by_level(level)
    return render_template('education/level.html', courses=courses, level=level)


@education_bp.route('/course/<course_id>')
def course(course_id):
    course = content_loader.get_course(course_id)
    lessons = content_loader.get_course_lessons_index(course_id)
    return render_template('education/course.html', course=course, lessons=lessons)


@education_bp.route('/course/<course_id>/lesson/<lesson_id>')
def lesson(course_id, lesson_id):
    lesson_content = content_loader.get_lesson(course_id, lesson_id)
    course = content_loader.get_course(course_id)
    return render_template('education/lesson.html', course=course, lesson=lesson_content)


@education_bp.route('/course/<course_id>/quiz', methods=['GET', 'POST'])
def quiz(course_id):
    course = content_loader.get_course(course_id)
    quiz_data = content_loader.get_quiz(course_id)
    result = None
    if request.method == 'POST':
        result = grading.grade_quiz(quiz_data, request.form)
        if result.get('score', 0) >= quiz_data.get('passing_score', 0):
            cert_generator.generate_certificate('guest', course.get('title'))
    return render_template('education/quiz.html', course=course, quiz=quiz_data, result=result)
