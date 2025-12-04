import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "lessons.db"

CourseInfo = Dict[str, object]
Lesson = Dict[str, object]


COURSE_TOPICS: Dict[str, Dict[str, List[str]]] = {
    "bitcoin-101": {
        "title": "Bitcoin 101 Fundamentals",
        "topics": [
            "What is Bitcoin?",
            "Keys and Addresses",
            "Transactions and UTXOs",
            "Proof-of-Work Mining",
            "Blocks and Consensus",
            "Running a Full Node",
            "Addresses and Privacy",
            "Fees and Mempool Dynamics",
            "Layered Ecosystem",
            "Digital Scarcity and Issuance",
            "Nodes, Miners, and Users",
            "Multisignature and Script",
            "Networking and Propagation",
            "Operational Best Practices",
            "Review and Practical Checklist",
        ],
    },
    "security-essentials": {
        "title": "Bitcoin Security Essentials",
        "topics": [
            "Threat Modeling",
            "Seed Phrase Protection",
            "Hardware Wallets",
            "Multisig Strategies",
            "Passphrases and Plausible Deniability",
            "Network Hygiene",
            "Physical Security",
            "Incident Response",
            "Custody Models",
            "Security for Lightning",
            "Regulatory Considerations",
            "Operational Maturity",
            "Backups and Recovery",
            "Security Culture",
            "Applied Security Labs",
        ],
    },
    "lightning-basics": {
        "title": "Lightning Network Basics",
        "topics": [
            "Why Lightning",
            "Opening Channels",
            "Routing Basics",
            "Invoices and LNURL",
            "Channel Updates",
            "Closing Channels",
            "Lightning Privacy",
            "Liquidity Management",
            "Lightning UX Patterns",
            "Operating a Routing Node",
            "Lightning Security",
            "Future of Lightning",
            "Building Lightning Apps",
            "Developer Tooling",
            "Performance Monitoring",
        ],
    },
    "bitcoin-business": {
        "title": "Bitcoin for Businesses",
        "topics": [
            "Treasury Strategy",
            "Custody and Governance",
            "Accounting Basics",
            "Payments and Invoicing",
            "Lightning for Commerce",
            "Tax and Reporting",
            "Payroll and Benefits",
            "Vendor Management",
            "Risk and Hedging",
            "Community and Brand",
            "Operational Resilience",
            "Bitcoin for Global Operations",
            "Customer Support",
            "Compliance Operations",
            "Executive Playbooks",
        ],
    },
    "bitcoin-economics": {
        "title": "Bitcoin Economics",
        "topics": [
            "Supply Curve",
            "Halvings and Market Cycles",
            "Difficulty and Security Budget",
            "Incentive Alignment",
            "Game Theory",
            "Network Effects",
            "Adoption Curves",
            "Mining Economics",
            "Fee Markets",
            "Macroeconomic Comparisons",
            "Global Liquidity",
            "Regulatory Impacts",
            "Derivatives and Hedging",
            "Capital Allocation",
            "Long-Term Valuation Models",
        ],
    },
}


PARAGRAPH_TEMPLATE = (
    "{topic} is explored through the lens of practical Bitcoin operations, combining conceptual clarity with lived examples. "
    "Learners see how the concept impacts real wallets, node operators, and businesses facing market pressure."
)

DETAIL_TEMPLATE = (
    "We examine the moving parts, common pitfalls, and mitigation strategies. The lesson links back to AdaptBTC best practices, "
    "inviting learners to interact with diagrams, glossaries, and checklists that mirror real-world deployments."
)

EXAMPLE_TEMPLATE = "Example: {topic} applied to a day-to-day decision shows why intentional design matters."



def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS courses (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                summary TEXT NOT NULL
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS lessons (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_id TEXT NOT NULL,
                lesson_order INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                examples TEXT NOT NULL,
                glossary TEXT NOT NULL,
                takeaways TEXT NOT NULL,
                diagram TEXT NOT NULL,
                UNIQUE(course_id, lesson_order)
            );
            """
        )
        conn.commit()
    seed_data()


def seed_data() -> None:
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.execute("SELECT COUNT(*) FROM courses")
        count = cur.fetchone()[0]
        if count:
            return
        for course_id, meta in COURSE_TOPICS.items():
            conn.execute(
                "INSERT OR IGNORE INTO courses (id, title, summary) VALUES (?, ?, ?)",
                (
                    course_id,
                    meta["title"],
                    f"A guided journey through {meta['title'].lower()} with AdaptBTC standards.",
                ),
            )
            for idx, topic in enumerate(meta["topics"], start=1):
                paragraphs = [
                    PARAGRAPH_TEMPLATE.format(topic=topic),
                    DETAIL_TEMPLATE,
                    "Learners get step-by-step walkthroughs, layered diagrams, and vocabulary to support conversations with peers and clients.",
                ]
                examples = [
                    EXAMPLE_TEMPLATE.format(topic=topic),
                    "Applied checklist: students record their own environment settings and share insights with the portal community feed.",
                ]
                glossary = {
                    "Key Term": f"Definition contextualized for {topic.lower()} operations.",
                    "Metric": f"A measurable signal to evaluate {topic.lower()} success.",
                }
                takeaways = [
                    f"{topic} connects to AdaptBTC risk controls and user empowerment.",
                    "Students leave with actionable next steps and reading references.",
                ]
                diagram = f"<div class='diagram'>Visualization of {topic} with arrows and callouts.</div>"
                conn.execute(
                    """
                    INSERT OR IGNORE INTO lessons (
                        course_id, lesson_order, title, content, examples, glossary, takeaways, diagram
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        course_id,
                        idx,
                        topic,
                        "\n\n".join(paragraphs),
                        "\n".join(examples),
                        "\n".join([f"{k}:{v}" for k, v in glossary.items()]),
                        "\n".join(takeaways),
                        diagram,
                    ),
                )
        conn.commit()


def list_courses() -> List[CourseInfo]:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.execute("SELECT id, title, summary FROM courses ORDER BY title")
        return [dict(row) for row in cur.fetchall()]


def get_course(course_id: str) -> Optional[CourseInfo]:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.execute("SELECT id, title, summary FROM courses WHERE id = ?", (course_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def list_lessons(course_id: str) -> List[Lesson]:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.execute(
            "SELECT lesson_order, title FROM lessons WHERE course_id = ? ORDER BY lesson_order",
            (course_id,),
        )
        return [dict(row) for row in cur.fetchall()]


def get_lesson(course_id: str, lesson_order: int) -> Optional[Lesson]:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.execute(
            """
            SELECT lesson_order, title, content, examples, glossary, takeaways, diagram
            FROM lessons WHERE course_id = ? AND lesson_order = ?
            """,
            (course_id, lesson_order),
        )
        row = cur.fetchone()
        if not row:
            return None
        lesson = dict(row)
        lesson["course_id"] = course_id
        return lesson


def next_prev(course_id: str, lesson_order: int) -> Tuple[Optional[int], Optional[int]]:
    lessons = list_lessons(course_id)
    orders = [l["lesson_order"] for l in lessons]
    if lesson_order not in orders:
        return None, None
    idx = orders.index(lesson_order)
    prev_order = orders[idx - 1] if idx > 0 else None
    next_order = orders[idx + 1] if idx + 1 < len(orders) else None
    return prev_order, next_order


