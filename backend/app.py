from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import config

app = Flask(__name__)
CORS(app)


def _config_error_response(key_name: str):
    """Return an error response when a required config value is missing."""

    return (
        jsonify(
            {
                "error": (
                    f"Missing {key_name}. Set the {key_name} environment variable "
                    "or update backend/config.py"
                )
            }
        ),
        500,
    )


def _missing_config_value(value: str | None) -> bool:
    return not value or "PASTE_YOUR" in value


@app.route("/api/new-address", methods=["POST"])
def new_address():
    if _missing_config_value(config.LNBITS_ADMIN_KEY):
        return _config_error_response("LNBITS_ADMIN_KEY")
    headers = {"X-Api-Key": config.LNBITS_ADMIN_KEY}
    url = f"{config.LNBITS_API_URL}/api/v1/wallet"
    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        return jsonify({"error": "Failed to generate address"}), 400
    data = r.json()
    return jsonify({"address": data.get("address")})


@app.route("/api/new-invoice", methods=["POST"])
def new_invoice():
    if _missing_config_value(config.LNBITS_INVOICE_KEY):
        return _config_error_response("LNBITS_INVOICE_KEY")
    body = request.json
    amount = body.get("amount", 0)
    memo = body.get("memo", "AdaptBTC Invoice")
    headers = {"X-Api-Key": config.LNBITS_INVOICE_KEY}
    payload = {"out": False, "amount": amount, "memo": memo}
    url = f"{config.LNBITS_API_URL}/api/v1/payments"
    r = requests.post(url, json=payload, headers=headers)
    if r.status_code != 201:
        return jsonify({"error": "Could not create invoice"}), 400
    data = r.json()
    return jsonify({
        "payment_hash": data.get("payment_hash"),
        "payment_request": data.get("payment_request")
    })


@app.route("/api/invoice-status/<payment_hash>", methods=["GET"])
def invoice_status(payment_hash):
    if _missing_config_value(config.LNBITS_INVOICE_KEY):
        return _config_error_response("LNBITS_INVOICE_KEY")
    headers = {"X-Api-Key": config.LNBITS_INVOICE_KEY}
    url = f"{config.LNBITS_API_URL}/api/v1/payments/{payment_hash}"
    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        return jsonify({"error": "Failed to check invoice"}), 400
    data = r.json()
    return jsonify({"paid": data.get("paid")})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
