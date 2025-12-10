import os
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_compress import Compress
from werkzeug.middleware.proxy_fix import ProxyFix

from backend.config import get_config

# database
# Keeping global db reference for models

db = SQLAlchemy()


def create_app():
    app = Flask(
        __name__,
        template_folder=os.path.join(os.path.dirname(__file__), "templates"),
        static_folder=os.path.join(os.path.dirname(__file__), "static"),
    )
    app.config.from_object(get_config())

    db.init_app(app)
    Compress(app)
    app.wsgi_app = ProxyFix(app.wsgi_app)

    register_security_headers(app)
    register_blueprints(app)
    register_error_handlers(app)

    @app.route("/")
    def home():
        return render_template("pages/index.html")

    return app


def register_security_headers(app: Flask):
    @app.after_request
    def add_headers(response):
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; font-src 'self' data:; connect-src 'self'"
        )
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


def register_blueprints(app: Flask):
    from backend.routes.main import main_bp
    from backend.routes.tools import tools_bp
    from backend.routes.portal import portal_bp
    from education.app.routes.education import education_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(tools_bp, url_prefix="/tools")
    app.register_blueprint(portal_bp, url_prefix="/portal")
    app.register_blueprint(education_bp, url_prefix="/education")


def register_error_handlers(app: Flask):
    @app.errorhandler(404)
    def not_found(error):
        return render_template("errors/404.html"), 404

    @app.errorhandler(500)
    def server_error(error):
        return render_template("errors/500.html"), 500
