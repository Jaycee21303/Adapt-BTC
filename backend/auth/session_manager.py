import sqlite3
from pathlib import Path
from typing import Optional

from flask import session

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "database" / "users.db"


def init_user_table() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash BLOB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        conn.commit()


def get_user(username: str) -> Optional[sqlite3.Row]:
    init_user_table()
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cur = conn.execute("SELECT * FROM users WHERE username = ?", (username,))
        return cur.fetchone()


def save_session(username: str) -> None:
    session["portal_user"] = username


def clear_session() -> None:
    session.pop("portal_user", None)


def current_user() -> Optional[str]:
    return session.get("portal_user")


def require_login() -> bool:
    return current_user() is not None

