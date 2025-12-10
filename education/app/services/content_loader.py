"""Content loader utilities for the AdaptBTC education portal."""
from __future__ import annotations

import json
import os
import time
from typing import Any, Dict, List, Optional

CONTENT_ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "content")
MANIFEST_PATH = os.path.join(CONTENT_ROOT, "catalog_manifest.json")
AUTO_RELOAD = os.environ.get("EDUCATION_PORTAL_DEV", "0") == "1"


class ManifestNotBuilt(Exception):
    """Raised when the manifest file has not been generated."""


class ManifestCache:
    """Manage manifest caching with optional dev auto-reload."""

    def __init__(self) -> None:
        self._cached_manifest: Optional[Dict[str, Any]] = None
        self._last_loaded_ts: float = 0.0
        self._last_mtime: float = 0.0

    def _manifest_needs_reload(self) -> bool:
        if not AUTO_RELOAD:
            return False
        try:
            current_mtime = os.path.getmtime(MANIFEST_PATH)
        except OSError:
            return True
        return current_mtime > self._last_mtime

    def load(self) -> Dict[str, Any]:
        if self._cached_manifest is None or self._manifest_needs_reload():
            if not os.path.exists(MANIFEST_PATH):
                raise ManifestNotBuilt("Manifest missing. Run manifest_builder.build().")
            with open(MANIFEST_PATH, "r", encoding="utf-8") as handle:
                self._cached_manifest = json.load(handle)
            self._last_loaded_ts = time.time()
            self._last_mtime = os.path.getmtime(MANIFEST_PATH)
        return self._cached_manifest or {"courses": []}

    def clear(self) -> None:
        self._cached_manifest = None
        self._last_loaded_ts = 0.0
        self._last_mtime = 0.0


_manifest_cache = ManifestCache()


def load_manifest() -> Dict[str, Any]:
    """Load the manifest from cache or disk."""

    return _manifest_cache.load()


def refresh_manifest_cache() -> Dict[str, Any]:
    """Force the manifest cache to reload from disk."""

    _manifest_cache.clear()
    return load_manifest()


def get_all_courses() -> List[Dict[str, Any]]:
    return load_manifest().get("courses", [])


def get_courses_by_level(level: int) -> List[Dict[str, Any]]:
    return [course for course in get_all_courses() if course.get("level") == level]


def get_courses_by_track(track: str) -> List[Dict[str, Any]]:
    return [course for course in get_all_courses() if course.get("track") == track]


def get_course(course_id: str) -> Optional[Dict[str, Any]]:
    return next((c for c in get_all_courses() if c.get("id") == course_id), None)


def get_course_lessons_index(course_id: str) -> List[Dict[str, Any]]:
    course = get_course(course_id)
    if not course:
        return []
    return course.get("lessons", [])


def _parse_frontmatter(raw: str) -> tuple[Dict[str, Any], str]:
    if raw.startswith("---"):
        try:
            _, meta_block, body = raw.split("---", 2)
            meta: Dict[str, Any] = {}
            for line in meta_block.strip().splitlines():
                if ":" in line:
                    key, value = line.split(":", 1)
                    meta[key.strip()] = value.strip().strip('"')
            return meta, body
        except ValueError:
            return {}, raw
    return {}, raw


def _markdown_to_html(body: str) -> str:
    # Lightweight markdown handling to keep dependencies minimal.
    html_lines: List[str] = []
    for line in body.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith("## "):
            html_lines.append(f"<h2>{stripped[3:]}</h2>")
        elif stripped.startswith("# "):
            html_lines.append(f"<h1>{stripped[2:]}</h1>")
        else:
            html_lines.append(f"<p>{stripped}</p>")
    return "\n".join(html_lines)


def get_lesson(course_id: str, lesson_id: str) -> Optional[Dict[str, Any]]:
    course = get_course(course_id)
    if not course:
        return None
    lesson_file = os.path.join(course.get("path", ""), "lessons", f"{lesson_id}.md")
    if not os.path.exists(lesson_file):
        return None
    with open(lesson_file, "r", encoding="utf-8") as handle:
        raw = handle.read()
    meta, body = _parse_frontmatter(raw)
    return {"meta": meta, "html": _markdown_to_html(body)}


def get_quiz(course_id: str) -> Optional[Dict[str, Any]]:
    course = get_course(course_id)
    if not course:
        return None
    quiz_file = os.path.join(course.get("path", ""), "quiz.json")
    if not os.path.exists(quiz_file):
        return None
    with open(quiz_file, "r", encoding="utf-8") as handle:
        return json.load(handle)


def search_courses(
    query: Optional[str] = None,
    level: Optional[int] = None,
    track: Optional[str] = None,
    tags: Optional[List[str]] = None,
    sort: Optional[str] = None,
) -> List[Dict[str, Any]]:
    courses = get_all_courses()
    if query:
        lowered = query.lower()
        courses = [
            course
            for course in courses
            if lowered in course.get("title", "").lower()
            or lowered in (course.get("summary") or "").lower()
            or any(lowered in tag.lower() for tag in course.get("tags", []))
        ]
    if level is not None:
        courses = [course for course in courses if course.get("level") == level]
    if track:
        courses = [course for course in courses if course.get("track") == track]
    if tags:
        courses = [course for course in courses if set(tags).issubset(set(course.get("tags", [])))]

    sort_key = {
        "title": lambda c: c.get("title", ""),
        "estimated_hours": lambda c: c.get("estimated_hours", 0),
        "level": lambda c: c.get("level", 0),
    }.get(sort or "", None)

    if sort_key:
        courses = sorted(courses, key=sort_key)
    return courses
