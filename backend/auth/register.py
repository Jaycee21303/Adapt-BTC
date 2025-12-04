import sqlite3
from pathlib import Path
from typing import Tuple

import bcrypt

from .session_manager import DB_PATH, init_user_table


MIN_PASSWORD_LENGTH = 8


def create_user(username: str, password: str) -> Tuple[bool, str]:
    username = username.strip()
    if not username:
        return False, "Username is required."
    if len(password) < MIN_PASSWORD_LENGTH:
        return False, f"Password must be at least {MIN_PASSWORD_LENGTH} characters long."

    init_user_table()
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cur = conn.execute("SELECT id FROM users WHERE username = ?", (username,))
            if cur.fetchone():
                return False, "Username already exists."
            salt = bcrypt.gensalt()
            password_hash = bcrypt.hashpw(password.encode(), salt)
            conn.execute(
                "INSERT INTO users (username, password_hash) VALUES (?, ?)",
                (username, password_hash),
            )
            conn.commit()
            return True, "Account created successfully."
    except sqlite3.Error as exc:
        return False, f"Database error: {exc}"

