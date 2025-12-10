import os
from flask import Flask, render_template, send_from_directory
from learning_portal.portal_routes import portal

app = Flask(__name__, template_folder="templates")
app.secret_key = os.getenv("SECRET_KEY", "dev_secret_key")

# Register Learning Portal blueprint
app.register_blueprint(portal)


# ------------------------------
# MAIN SITE ROUTES
# ------------------------------

@app.route("/")
def home():
    return render_template("index.html")


@app.route("/tools")
def tools():
    return render_template("tools.html")


@app.route("/consulting")
def consulting():
    return render_template("consulting.html")


@app.route("/donate")
def donate():
    return render_template("donate.html")


@app.route("/learning")
def learning():
    return render_template("learning.html")


# ------------------------------
# TOOL ROUTES
# ------------------------------

@app.route("/tools/live-feed")
def live_feed():
    return render_template("tools/live-feed.html")


@app.route("/tools/dca")
def dca():
    return render_template("tools/dca.html")


# Static assets for DCA Tool
@app.route("/tools/dca/assets/<path:filename>")
def dca_asset(filename):
    return send_from_directory(os.path.join("tools", "dca"), filename)


# ------------------------------
# ERROR HANDLERS
# ------------------------------

@app.errorhandler(404)
def page_not_found(e):
    return render_template("errors/404.html"), 404


@app.errorhandler(500)
def server_error(e):
    return render_template("errors/500.html"), 500


# ------------------------------
# MAIN ENTRY
# ------------------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
