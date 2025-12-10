import json
import os
from functools import lru_cache
from typing import Dict, Any

CONTENT_ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "content")
MANIFEST_PATH = os.path.join(CONTENT_ROOT, "catalog_manifest.json")


def _load_json(path):
    with open(path, "r", encoding="utf-8") as handle:
        return json.load(handle)


def _parse_frontmatter(raw: str):
    if raw.startswith("---"):
        try:
            _, meta, body = raw.split("---", 2)
            meta_dict = {}
            for line in meta.strip().splitlines():
                if ":" in line:
                    key, value = line.split(":", 1)
                    meta_dict[key.strip()] = value.strip().strip('"')
            return meta_dict, body
        except ValueError:
            pass
    return {}, raw


def _markdown(body: str) -> str:
    body = body.replace("\n\n", "</p><p>")
    return f"<p>{body}</p>"


@lru_cache(maxsize=1)
def load_manifest() -> Dict[str, Any]:
    if not os.path.exists(MANIFEST_PATH):
        return {"courses": []}
    return _load_json(MANIFEST_PATH)


def get_all_courses():
    return load_manifest().get("courses", [])


def get_courses_by_level(level: int):
    return [c for c in get_all_courses() if c.get("level") == level]


def get_course(course_id: str):
    return next((c for c in get_all_courses() if c.get("id") == course_id), None)


def get_course_lessons_index(course_id: str):
    course = get_course(course_id)
    if not course:
        return []
    return course.get("lessons", [])


def get_lesson(course_id: str, lesson_id: str):
    course = get_course(course_id)
    if not course:
        return None
    path = course.get("path")
    lesson_file = os.path.join(path, "lessons", f"{lesson_id}.md")
    if not os.path.exists(lesson_file):
        return None
    with open(lesson_file, "r", encoding="utf-8") as handle:
        raw = handle.read()
    meta, body = _parse_frontmatter(raw)
    html = _markdown(body)
    return {"meta": meta, "html": html}


def get_quiz(course_id: str):
    course = get_course(course_id)
    if not course:
        return None
    quiz_file = os.path.join(course.get("path"), "quiz.json")
    if not os.path.exists(quiz_file):
        return None
    return _load_json(quiz_file)


def refresh_manifest_cache():
    load_manifest.cache_clear()
    return load_manifest()
