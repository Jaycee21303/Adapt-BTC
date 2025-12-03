"""Backend package initializer for the Flask API service."""

# Having an __init__ ensures backend.* imports resolve when gunicorn loads
# the Flask app entrypoint.
