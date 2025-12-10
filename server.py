"""
AdaptBTC Flask application entrypoint.

This module creates a Flask application with sensible defaults for
configuration, session storage and error handling. Routes are defined
to render static HTML templates from the ``templates`` directory and
delegate handling of section pages to a helper function. See
blueprints for additional registered route groups.

To run the development server locally execute this file directly. In
production, the ``app`` object should be served by a WSGI server such
as Gunicorn and debug mode should be disabled.
"""

from __future__ import annotations

from pathlib import Path
import os
from typing import Optional

from flask import Flask, abort, redirect, render_template, send_from_directory, url_for
from flask_session import Session

from blueprints import register_blueprints

def create_app() -> Flask:
    """Create and configure the Flask application.

    Returns
    -------
    Flask
        A configured Flask application ready to be served.
    """
    app = Flask(
        __name__,
        static_folder="assets",
        static_url_path="/assets",
        template_folder="templates",
    )

    # Secret key for session signing – fall back to a dev key in development.
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")
    # Use filesystem-based sessions. For production you may want to
    # configure redis or another backend via the SESSION_TYPE env var.
    app.config["SESSION_TYPE"] = os.environ.get("SESSION_TYPE", "filesystem")
    Session(app)

    # Register any blueprints defined in the blueprints package.
    register_blueprints(app)

    def render_existing(template_name: str) -> str:
        """Render a template if it exists on disk.

        Parameters
        ----------
        template_name : str
            The relative path to the template under ``templates``.

        Returns
        -------
        str
            Rendered HTML or a 404 response when the template is missing.
        """
        template_path = Path(app.template_folder) / template_name
        if template_path.is_file():
            return render_template(template_name)
        abort(404)

    def render_section(section: str, page: str) -> str:
        """Render a page inside a section, adding ``.html`` when needed."""
        normalized = page if page.endswith(".html") else f"{page}.html"
        return render_existing(f"{section}/{normalized}")

    # Define simple routes that map directly to static pages.
    @app.route("/")
    def index() -> str:
        return render_existing("pages/index.html")

    @app.route("/learning")
    @app.route("/education")
    def learning() -> str:
        return redirect(url_for("education.portal_home"))

    @app.route("/tools")
    def tools() -> str:
        return render_existing("pages/tools.html")

    @app.route("/tools/<tool_slug>")
    def tool_detail(tool_slug: str) -> str:
        return render_existing(f"pages/tools/{tool_slug}.html")

    @app.route("/wallet-generator")
    @app.route("/wallet-generator.html")
    def wallet_generator() -> str:
        return render_existing("wallet-generator.html")

    @app.route("/consulting")
    def consulting() -> str:
        return render_existing("pages/consulting.html")

    @app.route("/consulting/contact")
    @app.route("/consulting/contact.html")
    def consulting_contact() -> str:
        return render_existing("pages/consulting-contact.html")

    @app.route("/donate")
    def donate() -> str:
        return render_existing("pages/donate.html")

    @app.route("/main-site/<path:page>")
    def main_site_page(page: str) -> str:
        # Redirect all unknown main-site pages back to the home page.
        return redirect(url_for("index"))

    @app.route("/learning-portal/<path:page>")
    def learning_portal_page(page: str) -> str:
        return render_section("learning-portal", page)

    @app.route("/tools-portal/<path:page>")
    def tools_portal_page(page: str) -> str:
        return render_section("tools-portal", page)

    # Custom error handlers.
    @app.errorhandler(404)
    def handle_404(_error: Exception) -> tuple[str, int]:
        return render_template("errors/404.html"), 404

    @app.errorhandler(500)
    def handle_500(_error: Exception) -> tuple[str, int]:
        return render_template("errors/500.html"), 500

    return app


# Create a module-level application instance so that WSGI servers can
# reference ``server:app``. This pattern matches the original code
# but instantiates the app lazily.
app: Optional[Flask] = None
if app is None:
    app = create_app()

if __name__ == "__main__":
    # Local development convenience: run the Flask development server.
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)