from __future__ import annotations

import os
from datetime import datetime
from typing import Dict, Any
from flask import Flask, jsonify, render_template, send_from_directory, abort

from modules.accounting import get_financial_snapshot
from modules.borrow import get_borrowing_options
from modules.lightning import get_lightning_health
from modules.readiness import get_readiness_checks
from modules.roadmap import get_roadmap

app = Flask(__name__, static_folder="static", template_folder="templates")


@app.route("/")
def index() -> str:
    return render_template("index.html")


@app.route("/tools")
def tools() -> str:
    return render_template("tools.html")


@app.route("/accounting")
def accounting() -> str:
    finance = get_financial_snapshot()
    return render_template("accounting.html", finance=finance)


@app.route("/lightning")
def lightning() -> str:
    lightning_data = get_lightning_health()
    return render_template("lightning.html", lightning=lightning_data)


@app.route("/borrow")
def borrow() -> str:
    borrow_data = get_borrowing_options()
    return render_template("borrow.html", borrow=borrow_data)


@app.route("/dashboard")
@app.route("/dashboard.html")
def dashboard() -> str:
    return render_template("dashboard.html")


@app.route("/api/engine/summary")
def engine_summary() -> Dict[str, Any]:
    return jsonify(
        {
            "readiness": get_readiness_checks(),
            "lightning": get_lightning_health(),
            "finance": get_financial_snapshot(),
            "borrow": get_borrowing_options(),
            "roadmap": get_roadmap(),
            "generated_at": datetime.utcnow().isoformat() + "Z",
        }
    )


@app.route("/partials/<path:filename>")
def serve_partials(filename: str):
    return send_from_directory("partials", filename)


@app.route("/components/<path:filename>")
def serve_components(filename: str):
    return send_from_directory("components", filename)


@app.route("/assets/<path:filename>")
def serve_assets(filename: str):
    return send_from_directory("assets", filename)


@app.route("/css/<path:filename>")
def serve_css(filename: str):
    return send_from_directory("css", filename)


@app.route("/js/<path:filename>")
def serve_js(filename: str):
    return send_from_directory("js", filename)


@app.route("/static/<path:filename>")
def serve_static(filename: str):
    return send_from_directory(app.static_folder, filename)


@app.route("/<path:resource>")
def serve_root_files(resource: str):
    if os.path.isfile(resource):
        return send_from_directory(".", resource)
    abort(404)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), debug=False)
