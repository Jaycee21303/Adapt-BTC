import json
import os
from glob import glob

from .content_loader import CONTENT_ROOT, MANIFEST_PATH

REQUIRED_COURSE_FIELDS = {"id", "title", "level", "track", "estimated_hours", "prerequisites", "learning_objectives", "tags"}


def _parse_meta(content: str):
    if content.startswith("---"):
        try:
            _, meta, _ = content.split("---", 2)
            meta_dict = {}
            for line in meta.strip().splitlines():
                if ":" in line:
                    key, value = line.split(":", 1)
                    meta_dict[key.strip()] = value.strip().strip('"')
            return meta_dict
        except ValueError:
            return {}
    return {}


def build_manifest():
    courses = []
    for course_json in glob(os.path.join(CONTENT_ROOT, "**", "course.json"), recursive=True):
        with open(course_json, "r", encoding="utf-8") as handle:
            course_data = json.load(handle)
        course_dir = os.path.dirname(course_json)
        course_data["path"] = course_dir
        lessons = []
        for lesson_file in sorted(glob(os.path.join(course_dir, "lessons", "*.md"))):
            lesson_id = os.path.splitext(os.path.basename(lesson_file))[0]
            with open(lesson_file, "r", encoding="utf-8") as handle:
                content = handle.read()
            meta = _parse_meta(content)
            lessons.append({"id": lesson_id, "title": meta.get("title", lesson_id), "order": int(meta.get("order", 0))})
        lessons = sorted(lessons, key=lambda x: x.get("order", 0))
        course_data["lessons"] = lessons
        course_data["quiz"] = os.path.exists(os.path.join(course_dir, "quiz.json"))
        missing_fields = [f for f in REQUIRED_COURSE_FIELDS if f not in course_data]
        course_data["valid"] = not missing_fields
        course_data["errors"] = missing_fields
        courses.append(course_data)

    manifest = {"courses": courses}
    os.makedirs(os.path.dirname(MANIFEST_PATH), exist_ok=True)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2)
    return manifest


if __name__ == "__main__":
    build_manifest()
