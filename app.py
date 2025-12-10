import os
from flask import Flask, render_template, send_from_directory

from learning_portal.portal_routes import portal

app = Flask(
    __name__,
    static_folder="assets",
    static_url_path="/assets",
    template_folder="templates",
)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key")

app.register_blueprint(portal)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/tools")
def tools():
    return render_template("tools.html")


@app.route("/tools/dca")
def dca():
    return render_template("tools/dca.html")


@app.route("/tools/dca/assets/<path:filename>")
def dca_asset(filename: str):
    return send_from_directory(os.path.join(app.root_path, "tools", "dca"), filename)


@app.route("/consulting")
def consulting():
    return render_template("consulting.html")


@app.route("/donate")
def donate():
    return render_template("donate.html")


@app.route("/learning")
def learning():
    return render_template("learning.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
