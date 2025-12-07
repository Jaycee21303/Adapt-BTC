"""
WSGI entrypoint for the AdaptBTC Flask application.

Expose the ``app`` instance from :mod:`server` for WSGI servers like
Gunicorn. When run directly, this module will start a development
server which should not be used in production.
"""
from flask import redirect, request

from server import app  # noqa: F401  import side effect

ONRENDER_HOST_FRAGMENT = ("onrender", ".com")


@app.before_request
def force_custom_domain():
    host = request.headers.get("Host", "")
    if "".join(ONRENDER_HOST_FRAGMENT) in host:
        return redirect("https://adaptbtc.com" + request.full_path, code=301)

__all__ = ["app"]

if __name__ == "__main__":
    # Running ``python app.py`` will serve the application via Flask's
    # development server. This should only be used for local testing.
    app.run(host="0.0.0.0", port=5000, debug=True)
