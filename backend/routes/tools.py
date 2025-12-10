from flask import Blueprint, render_template

from backend.services.btc_price_service import get_current_price


tools_bp = Blueprint("tools", __name__)


@tools_bp.route("/")
def tools_home():
    return render_template("pages/tools.html")


@tools_bp.route("/wallet-generator")
def wallet_generator():
    return render_template("pages/wallet-generator.html")


@tools_bp.route("/dca")
def dca_tool():
    price = get_current_price()
    return render_template("pages/dca-tool.html", current_price=price)
