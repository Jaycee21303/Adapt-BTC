import sqlite3
from pathlib import Path
from typing import Dict, List, Tuple

from backend.logic.content_library import BITCOIN_101_QUIZ, SECURITY_ESSENTIALS_QUIZ

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "quizzes.db"

Question = Dict[str, object]
QUIZZES: Dict[str, List[Question]] = {}

QUIZ_BANK: Dict[str, List[Question]] = {
    "bitcoin-101": BITCOIN_101_QUIZ,
    "security-essentials": SECURITY_ESSENTIALS_QUIZ,
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
    for course, questions in QUIZ_BANK.items():
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
    answers_blob = "\n".join(
        [
            f"{item['prompt']}|{item['user_answer']}|{item['correct_answer']}|{int(item['is_correct'])}"
            for item in graded
        ]
    )
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
