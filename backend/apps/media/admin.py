from django.contrib import admin

from .models import VideoAsset


@admin.register(VideoAsset)
class VideoAssetAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "product",
        "source_type",
        "duration_seconds",
        "duration_verified",
        "status",
        "is_primary",
        "created_at",
    )

    list_filter = (
        "source_type",
        "status",
        "duration_verified",
    )

    search_fields = (
        "product__title",
        "product__sku",
    )

    readonly_fields = (
        "id",
        "file_size",
        "mime_type",
        "duration_verified",
        "created_at",
        "updated_at",
    )