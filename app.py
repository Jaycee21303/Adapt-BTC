"""WSGI entrypoint for running the Flask app with Gunicorn.

Exposes the Flask ``app`` instance so process managers can use the default
``app:app`` target without referring to the ``server`` module directly.
"""
from server import app

__all__ = ["app"]


if __name__ == "__main__":
    # Local development convenience
    app.run(host="0.0.0.0", port=5000, debug=True)
