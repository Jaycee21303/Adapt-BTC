import json
import os
from datetime import datetime

import requests

CACHE_PATH = os.path.join(os.path.dirname(__file__), "..", "static", "price_cache.json")
API_URL = "https://api.coindesk.com/v1/bpi/currentprice/BTC.json"

def get_current_price():
    try:
        response = requests.get(API_URL, timeout=5)
        data = response.json()
        return float(data["bpi"]["USD"]["rate_float"])
    except Exception:
        if os.path.exists(CACHE_PATH):
            with open(CACHE_PATH, "r", encoding="utf-8") as fh:
                cached = json.load(fh)
                return cached.get("price")
        return None

def cache_price(price: float):
    os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
    with open(CACHE_PATH, "w", encoding="utf-8") as fh:
        json.dump({"price": price, "cached_at": datetime.utcnow().isoformat()}, fh)
