
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from apps.catalog.models import Product
from apps.media.models import VideoAsset
from apps.media.services import inspect_uploaded_video
from apps.media.validators import validate_video_duration


class VideoAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = VideoAsset
        fields = [
            "id",
            "product",
            "source_type",
            "video_file",
            "external_url",
            "duration_seconds",
            "file_size",
            "mime_type",
            "duration_verified",
            "status",
            "moderation_notes",
            "is_primary",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "file_size",
            "mime_type",
            "duration_verified",
            "status",
            "moderation_notes",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user

        source_type = attrs.get("source_type")
        video_file = attrs.get("video_file")
        external_url = attrs.get("external_url", "")
        duration = attrs.get("duration_seconds")
        product = attrs.get("product")

        if product is None:
            raise serializers.ValidationError({
                "product": "A product is required."
            })

        if product.seller_id != user.id:
            raise serializers.ValidationError({
                "product": "You can only upload videos to your own products."
            })

        if source_type == "UPLOAD":
            if not video_file:
                raise serializers.ValidationError({
                    "video_file": "A video file is required."
                })

            if external_url:
                raise serializers.ValidationError({
                    "external_url": "External URL must be empty for uploaded videos."
                })

            try:
                inspection = inspect_uploaded_video(video_file)
            except DjangoValidationError as exc:
                raise serializers.ValidationError({
                    "video_file": exc.messages
                })

            attrs["_inspection"] = inspection

        elif source_type == "EXTERNAL_URL":
            if not external_url:
                raise serializers.ValidationError({
                    "external_url": "An HTTPS video URL is required."
                })

            if video_file:
                raise serializers.ValidationError({
                    "video_file": "Do not upload a file when using an external URL."
                })

            if not external_url.lower().startswith("https://"):
                raise serializers.ValidationError({
                    "external_url": "Only HTTPS URLs are allowed."
                })

            if duration is None:
                raise serializers.ValidationError({
                    "duration_seconds": "Duration is required for external videos."
                })

            try:
                validate_video_duration(duration)
            except DjangoValidationError as exc:
                raise serializers.ValidationError({
                    "duration_seconds": exc.messages
                })

        else:
            raise serializers.ValidationError({
                "source_type": "Choose UPLOAD or EXTERNAL_URL."
            })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        inspection = validated_data.pop("_inspection", None)

        video = VideoAsset(
            **validated_data,
            status="PENDING_REVIEW",
        )

        if inspection:
            video.duration_seconds = inspection["duration_seconds"]
            video.file_size = inspection["file_size"]
            video.mime_type = inspection["mime_type"]
            video.duration_verified = True
        else:
            video.duration_verified = False

        video.full_clean()
        video.save()

        return video
