from __future__ import annotations

from typing import Dict, List


def get_borrowing_options() -> Dict[str, object]:
    lenders: List[Dict[str, object]] = [
        {
            "name": "Unchained",
            "rate": 10.5,
            "ltv": 0.45,
            "notes": "Best for conservative treasuries that want multisig control.",
        },
        {
            "name": "HodlHodl",
            "rate": 11.8,
            "ltv": 0.55,
            "notes": "Peer-to-peer flow, faster approvals, requires counterparty screening.",
        },
        {
            "name": "Kollider",
            "rate": 9.9,
            "ltv": 0.5,
            "notes": "Low-friction trading venue for dynamic hedging with BTC collateral.",
        },
    ]

    return {
        "lenders": lenders,
        "recommendation": "Use a blended approach: 50% multisig, 50% exchange-based liquidity for agility.",
    }
