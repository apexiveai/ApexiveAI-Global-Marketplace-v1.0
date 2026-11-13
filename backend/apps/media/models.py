import uuid

from django.core.exceptions import ValidationError
from django.core.validators import URLValidator
from django.db import models

from apps.catalog.models import Product

from .validators import (
    validate_video_extension,
    validate_video_size,
    validate_video_duration,
)


class VideoAsset(models.Model):

    class SourceType(models.TextChoices):
        UPLOAD = "UPLOAD", "Direct Upload"
        EXTERNAL_URL = "EXTERNAL_URL", "External URL"

    class Status(models.TextChoices):
        PENDING_REVIEW = "PENDING_REVIEW", "Pending Review"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        BLOCKED = "BLOCKED", "Blocked"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="videos",
    )

    source_type = models.CharField(
        max_length=20,
        choices=SourceType.choices,
    )

    video_file = models.FileField(
        upload_to="videos/%Y/%m/",
        blank=True,
        validators=[
            validate_video_extension,
            validate_video_size,
        ],
    )

    external_url = models.URLField(
        max_length=2048,
        blank=True,
    )

    duration_seconds = models.DecimalField(
        max_digits=8,
        decimal_places=3,
        null=True,
        blank=True,
    )

    file_size = models.PositiveBigIntegerField(
        default=0,
    )

    mime_type = models.CharField(
        max_length=120,
        blank=True,
    )

    duration_verified = models.BooleanField(
        default=False,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING_REVIEW,
        db_index=True,
    )

    moderation_notes = models.TextField(blank=True)

    is_primary = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

        indexes = [
            models.Index(fields=["product", "status"]),
            models.Index(fields=["source_type", "status"]),
        ]

    def clean(self):
        errors = {}

        if self.source_type == self.SourceType.UPLOAD:

            if not self.video_file:
                errors["video_file"] = (
                    "A video file is required for direct upload."
                )

            if self.external_url:
                errors["external_url"] = (
                    "External URL must be empty for direct uploads."
                )

        elif self.source_type == self.SourceType.EXTERNAL_URL:

            if not self.external_url:
                errors["external_url"] = (
                    "An external video URL is required."
                )

            if self.video_file:
                errors["video_file"] = (
                    "Direct upload file must be empty for external URLs."
                )

            if not self.duration_seconds:
                errors["duration_seconds"] = (
                    "Declared video duration is required."
                )

            if self.duration_seconds is not None:
                try:
                    validate_video_duration(self.duration_seconds)
                except ValidationError as exc:
                    errors["duration_seconds"] = exc.messages

            if self.external_url:
                try:
                    URLValidator(schemes=["https"])(self.external_url)
                except ValidationError:
                    errors["external_url"] = (
                        "Only valid HTTPS video URLs are accepted."
                    )

            # External URL duration is not automatically verified.
            if self.duration_verified:
                errors["duration_verified"] = (
                    "External video duration requires independent verification."
                )

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.title} - {self.source_type}"