import sqlite3
from typing import Tuple

import bcrypt

from .session_manager import DB_PATH, init_user_table


def verify_user(username: str, password: str) -> Tuple[bool, str]:
    username = username.strip()
    if not username or not password:
        return False, "Username and password are required."

    init_user_table()
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cur = conn.execute("SELECT password_hash FROM users WHERE username = ?", (username,))
            row = cur.fetchone()
            if not row:
                return False, "Invalid username or password."
            stored_hash = row["password_hash"]
            if isinstance(stored_hash, str):
                stored_hash = stored_hash.encode()
            if bcrypt.checkpw(password.encode(), stored_hash):
                return True, "Login successful."
            return False, "Invalid username or password."
    except sqlite3.Error as exc:
        return False, f"Database error: {exc}"

