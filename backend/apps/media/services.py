
import json
import os
import shutil
import subprocess
import tempfile

from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from pathlib import Path

from django.core.exceptions import ValidationError

from .validators import (
    validate_video_extension,
    validate_video_size,
    validate_video_duration,
)


def inspect_uploaded_video(uploaded_file):
    """
    Inspect an uploaded video using FFprobe.

    Windows-compatible implementation:
    - Writes upload to a temporary file.
    - Closes the temporary file before FFprobe accesses it.
    - Removes the temporary file after inspection.

    Returns:
    - duration_seconds
    - mime_type
    - file_size
    - verified
    """

    validate_video_extension(uploaded_file)
    validate_video_size(uploaded_file)

    ffprobe_path = shutil.which("ffprobe")

    if not ffprobe_path:
        raise ValidationError(
            "FFprobe is not installed or is not available in PATH."
        )

    original_position = uploaded_file.tell()
    temporary_path = None

    try:
        uploaded_file.seek(0)

        extension = Path(
            uploaded_file.name
        ).suffix.lower() or ".mp4"

        # Important for Windows:
        # Close the temporary file before FFprobe opens it.
        with tempfile.NamedTemporaryFile(
            suffix=extension,
            delete=False,
        ) as temporary_file:

            temporary_path = temporary_file.name

            for chunk in uploaded_file.chunks():
                temporary_file.write(chunk)

            temporary_file.flush()

        result = subprocess.run(
            [
                ffprobe_path,
                "-v", "error",
                "-show_entries",
                "format=duration,format_name",
                "-show_entries",
                "stream=codec_type,codec_name",
                "-of", "json",
                temporary_path,
            ],
            capture_output=True,
            text=True,
            timeout=60,
            check=False,
        )

        if result.returncode != 0:
            error_detail = (
                result.stderr.strip()
                or "Unknown FFprobe error."
            )

            raise ValidationError(
                f"The uploaded video could not be inspected: "
                f"{error_detail[:500]}"
            )

        try:
            metadata = json.loads(result.stdout)
        except json.JSONDecodeError as exc:
            raise ValidationError(
                "FFprobe returned invalid video metadata."
            ) from exc

        video_streams = [
            stream
            for stream in metadata.get("streams", [])
            if stream.get("codec_type") == "video"
        ]

        if not video_streams:
            raise ValidationError(
                "The uploaded file does not contain a video stream."
            )

        raw_duration = metadata.get(
            "format", {}
        ).get("duration")

        if raw_duration is None:
            raise ValidationError(
                "Unable to determine video duration."
            )

        try:
            duration = Decimal(str(raw_duration))
        except (InvalidOperation, TypeError, ValueError) as exc:
            raise ValidationError(
                "Invalid video duration metadata."
            ) from exc

        validate_video_duration(duration)

# VideoAsset.duration_seconds supports 3 decimal places.
# Normalize FFprobe duration before saving to the database.
        duration = duration.quantize(
            Decimal("0.001"),
            rounding=ROUND_HALF_UP,
        )

        format_name = metadata.get(
            "format", {}
        ).get("format_name", "")

        return {
            "duration_seconds": duration,
            "mime_type": format_name,
            "file_size": uploaded_file.size,
            "verified": True,
        }

    except subprocess.TimeoutExpired as exc:
        raise ValidationError(
            "Video inspection timed out. Please try another video."
        ) from exc

    except OSError as exc:
        raise ValidationError(
            f"Unable to execute FFprobe: {exc}"
        ) from exc

    finally:
        if temporary_path and os.path.exists(temporary_path):
            try:
                os.remove(temporary_path)
            except OSError:
                pass

        uploaded_file.seek(original_position)
