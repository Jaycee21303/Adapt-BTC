"""Blueprint registrations for AdaptBTC."""
from flask import Flask


def register_blueprints(app: Flask) -> None:
    from learning_portal.portal_routes import portal

    app.register_blueprint(portal)

