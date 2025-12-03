from __future__ import annotations

from typing import Dict


def get_financial_snapshot() -> Dict[str, object]:
    return {
        "holdings_btc": 3.75,
        "avg_cost_basis_usd": 28850,
        "current_price_usd": 42000,
        "projected_runway_months": 14,
        "notes": "Runway assumes current burn rate and Lightning channel management budget.",
    }
