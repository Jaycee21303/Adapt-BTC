"""Gunicorn configuration for running the Flask backend service."""

import multiprocessing
import os

# Respect the PORT environment variable used by many platforms (Heroku-style),
# and fall back to the port used in local development.
_port = os.getenv("PORT", "10000")
bind = f"0.0.0.0:{_port}"

# Use a sensible default worker count while allowing override via WORKERS.
workers = int(os.getenv("WORKERS", multiprocessing.cpu_count() * 2 + 1))
