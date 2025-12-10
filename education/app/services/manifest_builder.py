"""Manifest builder for the AdaptBTC education portal.

This module scans the education content directory, validates required
course metadata, and writes a cached manifest JSON file used by the
runtime loader. The manifest intentionally stores only lightweight
metadata (titles, IDs, lesson index) so that lesson bodies remain
lazy-loaded on demand.
"""
from __future__ import annotations

import argparse
import json
import os
from dataclasses import dataclass, field
from glob import glob
from typing import Dict, List, Optional

from .content_loader import CONTENT_ROOT, MANIFEST_PATH

REQUIRED_COURSE_FIELDS = {
    "id",
    "title",
    "level",
    "track",
    "estimated_hours",
    "prerequisites",
    "learning_objectives",
    "tags",
}


@dataclass
class LessonIndex:
    """Lightweight lesson entry persisted in the manifest."""

    id: str
    title: str
    order: int

    def as_dict(self) -> Dict[str, object]:
        return {"id": self.id, "title": self.title, "order": self.order}


@dataclass
class CourseEntry:
    """Validated course metadata for the manifest."""

    id: str
    title: str
    level: int
    track: str
    estimated_hours: float
    prerequisites: List[str]
    learning_objectives: List[str]
    tags: List[str]
    summary: Optional[str] = None
    author: Optional[str] = None
    last_updated: Optional[str] = None
    difficulty: Optional[str] = None
    lessons: List[LessonIndex] = field(default_factory=list)
    quiz_available: bool = False
    path: str = ""
    valid: bool = True
    errors: List[str] = field(default_factory=list)

    def as_dict(self) -> Dict[str, object]:
        payload = {
            "id": self.id,
            "title": self.title,
            "level": self.level,
            "track": self.track,
            "estimated_hours": self.estimated_hours,
            "prerequisites": self.prerequisites,
            "learning_objectives": self.learning_objectives,
            "tags": self.tags,
            "summary": self.summary,
            "author": self.author,
            "last_updated": self.last_updated,
            "difficulty": self.difficulty,
            "lessons": [lesson.as_dict() for lesson in self.lessons],
            "quiz": self.quiz_available,
            "path": self.path,
            "valid": self.valid,
            "errors": self.errors,
        }
        return payload


def _parse_frontmatter(content: str) -> Dict[str, object]:
    """Parse simple YAML-style frontmatter from a markdown file."""

    if not content.startswith("---"):
        return {}

    try:
        _, meta_raw, _ = content.split("---", 2)
    except ValueError:
        return {}

    meta: Dict[str, object] = {}
    for line in meta_raw.strip().splitlines():
        if not line or ":" not in line:
            continue
        key, value = line.split(":", 1)
        meta[key.strip()] = value.strip().strip('"')
    return meta


def _build_lessons(course_dir: str) -> List[LessonIndex]:
    lessons: List[LessonIndex] = []
    for lesson_file in sorted(glob(os.path.join(course_dir, "lessons", "*.md"))):
        lesson_id = os.path.splitext(os.path.basename(lesson_file))[0]
        try:
            with open(lesson_file, "r", encoding="utf-8") as handle:
                content = handle.read()
        except OSError:
            continue
        meta = _parse_frontmatter(content)
        title = meta.get("title", lesson_id)
        order = int(meta.get("order", 0) or 0)
        lessons.append(LessonIndex(id=lesson_id, title=title, order=order))
    return sorted(lessons, key=lambda lesson: lesson.order)


def _validate_course_payload(course_payload: Dict[str, object]) -> List[str]:
    missing = [field for field in REQUIRED_COURSE_FIELDS if field not in course_payload]
    return missing


def build_manifest() -> Dict[str, object]:
    """Scan the content tree and emit a manifest file."""

    courses: List[CourseEntry] = []
    for course_json in glob(os.path.join(CONTENT_ROOT, "**", "course.json"), recursive=True):
        try:
            with open(course_json, "r", encoding="utf-8") as handle:
                course_data = json.load(handle)
        except (OSError, json.JSONDecodeError) as exc:  # pragma: no cover - safe guard
            courses.append(
                CourseEntry(
                    id=os.path.basename(os.path.dirname(course_json)),
                    title="Invalid course",
                    level=0,
                    track="unknown",
                    estimated_hours=0,
                    prerequisites=[],
                    learning_objectives=[],
                    tags=[],
                    quiz_available=False,
                    path=os.path.dirname(course_json),
                    valid=False,
                    errors=[f"load error: {exc}"],
                )
            )
            continue

        course_dir = os.path.dirname(course_json)
        missing_fields = _validate_course_payload(course_data)
        lessons = _build_lessons(course_dir)
        quiz_exists = os.path.exists(os.path.join(course_dir, "quiz.json"))

        entry = CourseEntry(
            id=str(course_data.get("id", "")),
            title=course_data.get("title", "Untitled Course"),
            level=int(course_data.get("level", 0) or 0),
            track=str(course_data.get("track", "")),
            estimated_hours=float(course_data.get("estimated_hours", 0) or 0),
            prerequisites=list(course_data.get("prerequisites", [])),
            learning_objectives=list(course_data.get("learning_objectives", [])),
            tags=list(course_data.get("tags", [])),
            summary=course_data.get("summary"),
            author=course_data.get("author"),
            last_updated=course_data.get("last_updated"),
            difficulty=course_data.get("difficulty"),
            lessons=lessons,
            quiz_available=quiz_exists,
            path=course_dir,
            valid=not missing_fields,
            errors=missing_fields,
        )
        courses.append(entry)

    manifest = {"courses": [course.as_dict() for course in courses]}
    os.makedirs(os.path.dirname(MANIFEST_PATH), exist_ok=True)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2)
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the education catalog manifest.")
    parser.add_argument("command", choices=["build"], help="Command to run")
    args = parser.parse_args()
    if args.command == "build":
        build_manifest()


if __name__ == "__main__":
    main()
