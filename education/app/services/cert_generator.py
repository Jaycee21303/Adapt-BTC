import os
from datetime import datetime

CERT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "certs", "generated")


def generate_certificate(username: str, course_title: str):
    os.makedirs(CERT_DIR, exist_ok=True)
    cert_id = f"cert-{datetime.utcnow().timestamp()}".replace('.', '-')
    path = os.path.join(CERT_DIR, f"{cert_id}.txt")
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(f"Certificate for {username} completing {course_title} on {datetime.utcnow().date()}\n")
    return {"id": cert_id, "path": path}
