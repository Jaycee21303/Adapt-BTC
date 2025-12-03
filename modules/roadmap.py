from __future__ import annotations

from datetime import datetime, timedelta
from typing import Dict, List


def get_roadmap() -> Dict[str, object]:
    start = datetime.utcnow()
    phases: List[Dict[str, object]] = [
        {
            "name": "Foundation",
            "complete": True,
            "milestones": ["Custody drills", "Seed hygiene", "2-of-3 multisig"],
            "target": (start + timedelta(days=7)).date().isoformat(),
        },
        {
            "name": "Lightning rollout",
            "complete": False,
            "milestones": ["Channel bootstrapping", "POS integration", "In-store pilot"],
            "target": (start + timedelta(days=30)).date().isoformat(),
        },
        {
            "name": "Growth",
            "complete": False,
            "milestones": ["DCA automation", "Borrowing rails", "Treasury reporting"] ,
            "target": (start + timedelta(days=60)).date().isoformat(),
        },
    ]

    return {"phases": phases}
