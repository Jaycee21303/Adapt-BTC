import hashlib
from werkzeug.security import generate_password_hash, check_password_hash


def hash_password(password: str) -> str:
    return generate_password_hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return check_password_hash(hashed, password)


def checksum(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()
