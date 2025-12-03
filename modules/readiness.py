from __future__ import annotations

from datetime import datetime
from typing import List, Dict


def get_readiness_checks() -> Dict[str, object]:
    checks: List[Dict[str, object]] = [
        {
            "title": "Wallet hygiene",
            "status": "ok",
            "details": "Seed phrase verified, backups stored offline, multisig walkthrough completed.",
        },
        {
            "title": "Lightning node",
            "status": "attention",
            "details": "Channel backups exported, but liquidity target not met for customer traffic.",
        },
        {
            "title": "Incident drills",
            "status": "ok",
            "details": "Quarterly recovery drills scheduled with operations and finance sign-off.",
        },
    ]

    return {
        "checks": checks,
        "next_steps": [
            "Automate weekly channel backups to offline storage.",
            "Run a payment flow test against the staging POS.",
            "Finalize dollar-cost averaging budget for treasury growth.",
        ],
        "last_reviewed": datetime.utcnow().isoformat() + "Z",
    }
