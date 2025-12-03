from __future__ import annotations

from datetime import datetime
from typing import Dict, List


def get_lightning_health() -> Dict[str, object]:
    peers: List[Dict[str, object]] = [
        {"name": "ACINQ", "score": 92, "capacity_btc": 5.4, "status": "online"},
        {"name": "River", "score": 88, "capacity_btc": 3.1, "status": "online"},
        {"name": "Voltage", "score": 77, "capacity_btc": 1.8, "status": "degraded"},
    ]

    return {
        "peers": peers,
        "recommended_actions": [
            "Increase outbound liquidity with a 1M sat channel to River.",
            "Move the Voltage channel to a balanced state before marketing push.",
            "Rotate invoices to the highest-score peers during peak hours.",
        ],
        "updated": datetime.utcnow().isoformat() + "Z",
    }
