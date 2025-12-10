from flask import Blueprint, render_template

portal_bp = Blueprint("portal", __name__)


@portal_bp.route("/")
def portal_home():
    return render_template("pages/consulting.html")
