from pathlib import Path
import os

from flask import Flask, abort, render_template
from flask_session import Session

from blueprints import register_blueprints

app = Flask(__name__, static_folder="static", template_folder="templates")
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

register_blueprints(app)


def render_existing(template_name: str):
    template_path = Path(app.template_folder) / template_name
    if template_path.is_file():
        return render_template(template_name)
    abort(404)


def render_section(section: str, page: str):
    normalized = page if page.endswith(".html") else f"{page}.html"
    return render_existing(f"{section}/{normalized}")


@app.route("/")
def index():
    return render_existing("main-site/index.html")


@app.route("/tools")
def tools():
    return render_existing("main-site/tools.html")


@app.route("/consulting")
def consulting():
    return render_existing("consulting.html")


@app.route("/donate")
def donate():
    return render_existing("donate.html")


@app.route("/requirements")
def requirements():
    return render_existing("requirements.html")


@app.route("/education")
def education():
    return render_existing("main-site/education.html")


@app.route("/about")
def about():
    return render_existing("main-site/about.html")


@app.route("/business")
def business():
    return render_existing("main-site/business.html")


@app.route("/contact")
def contact():
    return render_existing("main-site/contact.html")


@app.route("/main-site/<path:page>")
def main_site_page(page: str):
    return render_section("main-site", page)


@app.route("/learning-portal/<path:page>")
def learning_portal_page(page: str):
    return render_section("learning-portal", page)


@app.route("/tools-portal/<path:page>")
def tools_portal_page(page: str):
    return render_section("tools-portal", page)


@app.errorhandler(404)
def handle_404(error):
    return render_template("errors/404.html"), 404


@app.errorhandler(500)
def handle_500(error):
    return render_template("errors/500.html"), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

