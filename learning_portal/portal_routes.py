from functools import wraps
from io import BytesIO
from typing import List

from flask import Blueprint, Response, flash, redirect, render_template, request, send_file, url_for

from backend.auth.login import verify_user
from backend.auth.register import create_user
from backend.auth.session_manager import clear_session, current_user, require_login, save_session
from backend.logic.certificate_generator import generate_certificate
from backend.logic.lesson_engine import get_course, get_lesson, list_courses, list_lessons, next_prev
from backend.logic.progress_tracker import completed, get_last, mark_complete, record_last, stats
from backend.logic.quiz_grader import PASSING_SCORE, get_attempts, get_questions, grade, save_attempt

portal = Blueprint(
    "portal",
    __name__,
    template_folder="templates",
    static_folder="static",
    url_prefix="/portal",
)


def login_required(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        if not require_login():
            flash("Please log in to access that page.", "warning")
            return redirect(url_for("portal.login"))
        return view_func(*args, **kwargs)

    return wrapper


@portal.route("/login", methods=["GET", "POST"])
def login():
    if current_user():
        return redirect(url_for("portal.dashboard"))
    error = None
    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        ok, message = verify_user(username, password)
        if ok:
            save_session(username)
            flash("Welcome back!", "success")
            return redirect(url_for("portal.dashboard"))
        error = message
        flash(message, "danger")
    return render_template("portal-login.html", error=error)


@portal.route("/register", methods=["GET", "POST"])
def register():
    if current_user():
        return redirect(url_for("portal.dashboard"))
    error = None
    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        ok, message = create_user(username, password)
        if ok:
            save_session(username)
            flash("Account created!", "success")
            return redirect(url_for("portal.dashboard"))
        error = message
        flash(message, "danger")
    return render_template("portal-register.html", error=error)


@portal.route("/logout")
@login_required
def logout():
    clear_session()
    flash("You have been logged out.", "info")
    return redirect(url_for("portal.login"))


@portal.route("/dashboard")
@login_required
def dashboard():
    username = current_user()
    course_summary = stats(username)
    courses = list_courses()
    lesson_totals = {course["id"]: len(list_lessons(course["id"])) for course in courses}
    return render_template(
        "portal-dashboard.html",
        username=username,
        courses=courses,
        course_summary=course_summary,
        lesson_totals=lesson_totals,
    )


@portal.route("/courses")
@login_required
def courses():
    return render_template("portal-course.html", courses=list_courses())


@portal.route("/courses/<course_id>")
@login_required
def course_detail(course_id):
    course = get_course(course_id)
    if not course:
        flash("Course not found.", "warning")
        return redirect(url_for("portal.courses"))
    lesson_list = list_lessons(course_id)
    user = current_user()
    last = get_last(user, course_id)
    return render_template(
        "portal-lesson.html",
        course=course,
        lessons=lesson_list,
        current_lesson=get_lesson(course_id, last),
        completed_lessons=completed(user, course_id),
        prev_next=next_prev(course_id, last),
    )


@portal.route("/courses/<course_id>/lesson/<int:order>")
@login_required
def lesson(course_id, order):
    course = get_course(course_id)
    lesson_data = get_lesson(course_id, order)
    if not course or not lesson_data:
        flash("Lesson not available.", "warning")
        return redirect(url_for("portal.courses"))
    record_last(current_user(), course_id, order)
    return render_template(
        "portal-lesson.html",
        course=course,
        lessons=list_lessons(course_id),
        current_lesson=lesson_data,
        completed_lessons=completed(current_user(), course_id),
        prev_next=next_prev(course_id, order),
    )


@portal.route("/courses/<course_id>/lesson/<int:order>/complete", methods=["POST"])
@login_required
def complete_lesson(course_id, order):
    mark_complete(current_user(), course_id, order, time_spent=120)
    flash("Lesson marked complete!", "success")
    return redirect(url_for("portal.lesson", course_id=course_id, order=order))


@portal.route("/courses/<course_id>/quiz")
@login_required
def quiz(course_id):
    course = get_course(course_id)
    if not course:
        flash("Course not found.", "warning")
        return redirect(url_for("portal.courses"))
    questions = get_questions(course_id)
    return render_template("portal-quiz.html", course=course, questions=questions)


@portal.route("/courses/<course_id>/quiz", methods=["POST"])
@login_required
def submit_quiz(course_id):
    answers: List[int] = []
    questions = get_questions(course_id)
    for idx, _ in enumerate(questions):
        answers.append(int(request.form.get(f"q{idx}", -1)))
    correct, total, score, graded = grade(course_id, answers)
    save_attempt(current_user(), course_id, correct, total, graded)
    passed = score >= PASSING_SCORE
    if passed:
        flash("Great work! You passed the quiz.", "success")
    else:
        flash("You did not reach the passing score. Review the lessons and try again.", "warning")
    return render_template(
        "portal-results.html",
        course=get_course(course_id),
        graded=graded,
        correct=correct,
        total=total,
        score=score,
        passed=passed,
    )


@portal.route("/certificate/<course_id>")
@login_required
def certificate(course_id):
    course = get_course(course_id)
    if not course:
        flash("Course not found.", "warning")
        return redirect(url_for("portal.dashboard"))
    verification_url = url_for("portal.dashboard", _external=True)
    png_bytes = generate_certificate(current_user(), course["title"], verification_url)
    return send_file(
        BytesIO(png_bytes),
        mimetype="image/png",
        as_attachment=True,
        download_name=f"{course_id}-certificate.png",
    )


@portal.route("/progress")
@login_required
def progress():
    username = current_user()
    course_data = stats(username)
    attempts = {cid: get_attempts(username, cid) for cid in course_data.keys()}
    return render_template(
        "portal-certificate.html",
        username=username,
        course_data=course_data,
        attempts=attempts,
    )

