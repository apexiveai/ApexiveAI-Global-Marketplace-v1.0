
from django.contrib import admin

from .models import SellerProfile, SellerReviewLog


@admin.register(SellerProfile)
class SellerProfileAdmin(admin.ModelAdmin):
    list_display = (
        "business_name",
        "user",
        "country",
        "city",
        "created_at",
    )

    search_fields = (
        "business_name",
        "legal_name",
        "user__username",
        "user__email",
    )

    list_filter = (
        "country",
        "created_at",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(SellerReviewLog)
class SellerReviewLogAdmin(admin.ModelAdmin):
    list_display = (
        "seller",
        "reviewed_by",
        "action",
        "created_at",
    )

    list_filter = (
        "action",
        "created_at",
    )

    search_fields = (
        "seller__username",
        "reviewed_by__username",
    )

    readonly_fields = (
        "seller",
        "reviewed_by",
        "action",
        "reason",
        "created_at",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
