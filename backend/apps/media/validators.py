from pathlib import Path

from django.conf import settings
from django.core.exceptions import ValidationError


ALLOWED_VIDEO_EXTENSIONS = {
    ".mp4",
    ".mov",
    ".webm",
    ".mkv",
}


def validate_video_extension(file):
    extension = Path(file.name).suffix.lower()

    if extension not in ALLOWED_VIDEO_EXTENSIONS:
        raise ValidationError(
            "Unsupported video format. "
            "Allowed formats: MP4, MOV, WEBM, MKV."
        )


def validate_video_size(file):
    max_size = getattr(
        settings,
        "MARKETPLACE_VIDEO_MAX_SIZE",
        200 * 1024 * 1024,
    )

    if file.size > max_size:
        raise ValidationError(
            f"Video file exceeds the maximum size of "
            f"{max_size // (1024 * 1024)} MB."
        )


def validate_video_duration(value):
    if value is None or value <= 0:
        raise ValidationError("Video duration must be greater than zero.")

    if value > 180:
        raise ValidationError(
            "Video duration cannot exceed 180 seconds."
        )