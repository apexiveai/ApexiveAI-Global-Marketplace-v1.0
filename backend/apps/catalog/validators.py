
from pathlib import Path

from django.core.exceptions import ValidationError
from PIL import Image


ALLOWED_IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
}

MAX_IMAGE_SIZE = 10 * 1024 * 1024


def validate_product_image(image_file):
    extension = Path(image_file.name).suffix.lower()

    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError(
            "Only JPG, JPEG, PNG and WEBP images are allowed."
        )

    if image_file.size > MAX_IMAGE_SIZE:
        raise ValidationError(
            "Image size cannot exceed 10 MB."
        )

    try:
        image_file.seek(0)

        with Image.open(image_file) as img:
            if img.format not in ("JPEG", "PNG", "WEBP"):
                raise ValidationError("Unsupported image format.")

            img.verify()

        image_file.seek(0)

    except ValidationError:
        raise

    except Exception:
        raise ValidationError("Invalid or corrupted image file.")
