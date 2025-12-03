from __future__ import annotations

import os
from datetime import datetime
from flask import Flask, jsonify, render_template, send_from_directory, abort

from modules.accounting import get_financial_snapshot
from modules.borrow import get_borrowing_options
from modules.lightning import get_lightning_health
from modules.readiness import get_readiness_checks
from modules.roadmap import get_roadmap


def create_app() -> Flask:
    app = Flask(
        __name__,
        static_folder="static",
        template_folder="templates",
    )

    @app.route("/")
    def serve_home():
        return send_from_directory(".", "adapt-lightning-tools.html")

    @app.route("/overview")
    def serve_overview():
        return send_from_directory(".", "index.html")

    @app.route("/dashboard")
    @app.route("/dashboard.html")
    def dashboard():
        return render_template("dashboard.html")

    @app.route("/api/engine/summary")
    def engine_summary():
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

    @app.route("/<path:resource>")
    def serve_static(resource: str):
        if os.path.isfile(resource):
            return send_from_directory(".", resource)
        abort(404)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8000)), debug=False)
