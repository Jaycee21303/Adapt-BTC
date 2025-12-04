import sqlite3
from pathlib import Path
from typing import Dict, List, Tuple

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "quizzes.db"

Question = Dict[str, object]
QUIZZES: Dict[str, List[Question]] = {}


BASE_QUESTIONS = [
    {
        "prompt": "Which statement best describes the course theme of {course}?",
        "options": [
            "It covers unrelated technologies.",
            "It gives practical, security-first Bitcoin guidance.",
            "It only focuses on altcoins.",
            "It is solely about legacy finance.",
        ],
        "answer": 1,
    },
    {
        "prompt": "What is the passing score for quizzes in this portal?",
        "options": ["50%", "60%", "80%", "100%"],
        "answer": 2,
    },
    {
        "prompt": "How are explanations delivered after grading?",
        "options": [
            "A random guess is shown.",
            "Detailed rationales for each question are stored with the attempt.",
            "No feedback is provided.",
            "Only incorrect answers are hidden.",
        ],
        "answer": 1,
    },
]


COURSE_SPECIFICS = {
    "bitcoin-101": [
        ("What secures Bitcoin transaction history?", ["Trusted validators", "Proof-of-work and nodes", "Central bank approvals", "Private committees"], 1),
        ("Why avoid address reuse?", ["It is illegal", "It harms privacy", "It slows the network", "It changes fees"], 1),
    ],
    "security-essentials": [
        ("Why use multisig?", ["To lower fees", "To distribute key control", "To speed confirmations", "To print coins"], 1),
        ("What protects seeds from fire?", ["Paper", "SMS backups", "Metal backups", "Email copies"], 2),
    ],
    "lightning-basics": [
        ("What is a payment channel?", ["An email server", "A bidirectional ledger between peers", "A mining pool", "A VPN"], 1),
        ("What enables privacy along routes?", ["Plaintext routing", "Onion routing", "HTTP proxies", "DNS"], 1),
    ],
    "bitcoin-business": [
        ("Why segregate duties?", ["To slow teams", "To improve fraud resistance", "To increase noise", "To hide data"], 1),
        ("What documents exchange rates?", ["Rumors", "Audits", "Pricing oracles", "Unsigned notes"], 2),
    ],
    "bitcoin-economics": [
        ("What limits supply?", ["A vote", "Central decree", "Protocol halving schedule", "Gold reserves"], 2),
        ("Why do fees matter long term?", ["They don't", "They replace subsidies", "They break consensus", "They ban mining"], 1),
    ],
}


PASSING_SCORE = 0.8


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS quiz_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                course_id TEXT NOT NULL,
                score REAL NOT NULL,
                total INTEGER NOT NULL,
                correct INTEGER NOT NULL,
                answers TEXT NOT NULL,
                taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        conn.commit()


def build_questions() -> None:
    if QUIZZES:
        return
    for course, specifics in COURSE_SPECIFICS.items():
        questions: List[Question] = []
        for base in BASE_QUESTIONS:
            questions.append(
                {
                    "prompt": base["prompt"].format(course=course.replace("-", " ").title()),
                    "options": base["options"],
                    "answer": base["answer"],
                    "explanation": "Core expectations for the AdaptBTC learning portal ensure consistent evaluation.",
                }
            )
        for prompt, options, answer in specifics:
            questions.append(
                {
                    "prompt": prompt,
                    "options": options,
                    "answer": answer,
                    "explanation": f"The correct choice aligns with {course} principles and security best practices.",
                }
            )
        # add filler scenarios to reach 12 questions
        scenario_count = 12 - len(questions)
        for i in range(scenario_count):
            questions.append(
                {
                    "prompt": f"Scenario {i+1}: Apply {course} concepts to a real-world decision.",
                    "options": [
                        "Ignore risk signals",
                        "Document assumptions, choose secure defaults",
                        "Share keys publicly",
                        "Delay decisions indefinitely",
                    ],
                    "answer": 1,
                    "explanation": "Documented, secure defaults ensure resilient outcomes for learners and businesses.",
                }
            )
        QUIZZES[course] = questions


def get_questions(course_id: str) -> List[Question]:
    build_questions()
    return QUIZZES.get(course_id, [])


def grade(course_id: str, submitted: List[int]) -> Tuple[int, int, float, List[Dict[str, object]]]:
    build_questions()
    questions = QUIZZES.get(course_id, [])
    correct = 0
    graded: List[Dict[str, object]] = []
    for idx, q in enumerate(questions):
        user_answer = submitted[idx] if idx < len(submitted) else -1
        is_correct = user_answer == q["answer"]
        if is_correct:
            correct += 1
        graded.append(
            {
                "prompt": q["prompt"],
                "options": q["options"],
                "user_answer": user_answer,
                "correct_answer": q["answer"],
                "is_correct": is_correct,
                "explanation": q["explanation"],
            }
        )
    total = len(questions)
    score = correct / total if total else 0
    return correct, total, score, graded


def save_attempt(username: str, course_id: str, correct: int, total: int, graded: List[Dict[str, object]]) -> None:
    init_db()
    answers_blob = "\n".join([
        f"{item['prompt']}|{item['user_answer']}|{item['correct_answer']}|{int(item['is_correct'])}"
        for item in graded
    ])
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT INTO quiz_attempts (username, course_id, score, total, correct, answers) VALUES (?, ?, ?, ?, ?, ?)",
            (username, course_id, correct / total if total else 0, total, correct, answers_blob),
        )
        conn.commit()


def get_attempts(username: str, course_id: str) -> List[Dict[str, object]]:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.execute(
            "SELECT score, total, correct, taken_at FROM quiz_attempts WHERE username = ? AND course_id = ? ORDER BY taken_at DESC",
            (username, course_id),
        )
        return [dict(row) for row in cur.fetchall()]

