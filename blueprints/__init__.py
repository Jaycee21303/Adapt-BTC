"""Blueprint registrations for AdaptBTC."""
from flask import Flask


def register_blueprints(app: Flask) -> None:
    from learning_portal.portal_routes import portal
    from education.app.routes.education import education_bp

    app.register_blueprint(portal)
    app.register_blueprint(education_bp, url_prefix="/education")

