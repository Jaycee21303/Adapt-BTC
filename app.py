"""
WSGI entrypoint for the AdaptBTC Flask application.

Expose the ``app`` instance from :mod:`server` for WSGI servers like
Gunicorn. When run directly, this module will start a development
server which should not be used in production.
"""
import os

from flask import redirect, render_template, request

from server import app  # noqa: F401  import side effect

PRIMARY_DOMAIN = os.getenv("PRIMARY_DOMAIN", "adaptbtc.com")
FORCE_PRIMARY_DOMAIN = os.getenv("FORCE_PRIMARY_DOMAIN", "1") != "0"
ONRENDER_HOST_FRAGMENT = ("onrender", ".com")


@app.before_request
def force_custom_domain():
    if not FORCE_PRIMARY_DOMAIN:
        return None

    host = request.headers.get("Host", "")
    if "".join(ONRENDER_HOST_FRAGMENT) in host:
        # Preserve query strings and paths while forcing the custom domain.
        # ``request.full_path`` always includes a trailing ``?`` even when
        # there are no query parameters, so strip it to avoid duplicate
        # question marks in the redirect target.
        full_path = request.full_path.rstrip("?")
        return redirect(f"https://{PRIMARY_DOMAIN}{full_path}", code=301)


@app.route("/DCAtool")
def dcatool() -> str:
    """Render the Bitcoin DCA projection tool."""

    return render_template("dcatool.html")

__all__ = ["app"]

if __name__ == "__main__":
    # Running ``python app.py`` will serve the application via Flask's
    # development server. This should only be used for local testing.
    app.run(host="0.0.0.0", port=5000, debug=True)
