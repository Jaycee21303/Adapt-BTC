"""Education portal routes."""
from flask import Blueprint, abort, redirect, render_template, request, url_for

from education.app.services import cert_generator, content_loader, grading


def _parse_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def create_blueprint() -> Blueprint:
    education_bp = Blueprint("education", __name__, template_folder="../../templates")

    @education_bp.route("/")
    def portal_home():
        query = request.args.get("q")
        level = _parse_int(request.args.get("level"))
        track = request.args.get("track")
        tags_raw = request.args.get("tags")
        sort = request.args.get("sort")
        tags = [tag.strip() for tag in tags_raw.split(",") if tag.strip()] if tags_raw else None
        courses = content_loader.search_courses(query=query, level=level, track=track, tags=tags, sort=sort)
        return render_template(
            "education/catalog.html",
            courses=courses,
            query=query,
            selected_level=level,
            selected_track=track,
            selected_tags=tags or [],
            sort=sort or "",
        )

    @education_bp.route("/level/<int:level>")
    def level(level: int):
        courses = content_loader.get_courses_by_level(level)
        return render_template("education/level.html", courses=courses, level=level)

    @education_bp.route("/track/<track_id>")
    def track(track_id: str):
        courses = content_loader.get_courses_by_track(track_id)
        return render_template("education/track.html", courses=courses, track=track_id)

    @education_bp.route("/course/<course_id>")
    def course(course_id: str):
        course_data = content_loader.get_course(course_id)
        if not course_data:
            abort(404)
        lessons = content_loader.get_course_lessons_index(course_id)
        return render_template("education/course.html", course=course_data, lessons=lessons)

    @education_bp.route("/course/<course_id>/lesson/<lesson_id>")
    def lesson(course_id: str, lesson_id: str):
        course_data = content_loader.get_course(course_id)
        if not course_data:
            abort(404)
        lesson_content = content_loader.get_lesson(course_id, lesson_id)
        if not lesson_content:
            abort(404)
        lessons_index = content_loader.get_course_lessons_index(course_id)
        return render_template(
            "education/lesson.html",
            course=course_data,
            lesson=lesson_content,
            lessons=lessons_index,
            current_lesson_id=lesson_id,
        )

    @education_bp.route("/course/<course_id>/quiz", methods=["GET", "POST"])
    def quiz(course_id: str):
        course_data = content_loader.get_course(course_id)
        if not course_data:
            abort(404)
        quiz_data = content_loader.get_quiz(course_id)
        if not quiz_data:
            abort(404)
        result = None
        if request.method == "POST":
            result = grading.grade_quiz(quiz_data, request.form)
            if result.get("score", 0) >= quiz_data.get("passing_score", 0):
                cert_generator.generate_certificate("guest", course_data.get("title"))
        return render_template("education/quiz.html", course=course_data, quiz=quiz_data, result=result)

    return education_bp


education_bp = create_blueprint()
