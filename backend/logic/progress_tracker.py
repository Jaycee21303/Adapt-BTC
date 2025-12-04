import sqlite3
from pathlib import Path
from typing import Dict, List, Optional

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "progress.db"


def init_db() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS lesson_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                course_id TEXT NOT NULL,
                lesson_order INTEGER NOT NULL,
                completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                time_spent INTEGER DEFAULT 0,
                UNIQUE(username, course_id, lesson_order)
            );
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS course_state (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                course_id TEXT NOT NULL,
                last_lesson INTEGER DEFAULT 1,
                UNIQUE(username, course_id)
            );
            """
        )
        conn.commit()


def mark_complete(username: str, course_id: str, lesson_order: int, time_spent: int = 0) -> None:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT OR REPLACE INTO lesson_progress (username, course_id, lesson_order, time_spent) VALUES (?, ?, ?, ?)",
            (username, course_id, lesson_order, time_spent),
        )
        conn.execute(
            "INSERT OR IGNORE INTO course_state (username, course_id, last_lesson) VALUES (?, ?, ?)",
            (username, course_id, lesson_order),
        )
        conn.execute(
            "UPDATE course_state SET last_lesson = ? WHERE username = ? AND course_id = ?",
            (lesson_order, username, course_id),
        )
        conn.commit()


def record_last(username: str, course_id: str, lesson_order: int) -> None:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT OR IGNORE INTO course_state (username, course_id, last_lesson) VALUES (?, ?, ?)",
            (username, course_id, lesson_order),
        )
        conn.execute(
            "UPDATE course_state SET last_lesson = ? WHERE username = ? AND course_id = ?",
            (lesson_order, username, course_id),
        )
        conn.commit()


def get_last(username: str, course_id: str) -> int:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.execute(
            "SELECT last_lesson FROM course_state WHERE username = ? AND course_id = ?",
            (username, course_id),
        )
        row = cur.fetchone()
        return row["last_lesson"] if row else 1


def completed(username: str, course_id: str) -> List[int]:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.execute(
            "SELECT lesson_order FROM lesson_progress WHERE username = ? AND course_id = ? ORDER BY lesson_order",
            (username, course_id),
        )
        return [row["lesson_order"] for row in cur.fetchall()]


def stats(username: str) -> Dict[str, Dict[str, object]]:
    init_db()
    summary: Dict[str, Dict[str, object]] = {}
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.execute(
            "SELECT course_id, COUNT(*) as completed FROM lesson_progress WHERE username = ? GROUP BY course_id",
            (username,),
        )
        for row in cur.fetchall():
            summary[row["course_id"]] = {"lessons_completed": row["completed"], "last_lesson": 1}
        cur = conn.execute(
            "SELECT course_id, last_lesson FROM course_state WHERE username = ?",
            (username,),
        )
        for row in cur.fetchall():
            summary.setdefault(row["course_id"], {}).update({"last_lesson": row["last_lesson"]})
    return summary

