from django.contrib import admin
from .models import (
    AutomotiveCommission,
    AutomotiveInquiry,
    AutomotivePartnerProfile,
    AutomotiveSpecification,
    AutomotiveTestDriveRequest,
)


@admin.register(AutomotiveSpecification)
class AutomotiveSpecificationAdmin(admin.ModelAdmin):
    list_display = (
        "make",
        "model_name",
        "model_year",
        "fuel_type",
        "transmission",
        "product",
    )

    list_filter = ("fuel_type", "transmission", "body_type")
    search_fields = ("make", "model_name", "vin", "product__title")


@admin.register(AutomotivePartnerProfile)
class AutomotivePartnerProfileAdmin(admin.ModelAdmin):
    list_display = ("display_name", "slug", "user", "is_official_partner")
    list_filter = ("is_official_partner",)
    search_fields = ("display_name", "slug", "user__username")


@admin.register(AutomotiveInquiry)
class AutomotiveInquiryAdmin(admin.ModelAdmin):
    list_display = ("name", "product", "email", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("name", "email", "phone", "product__title")
    readonly_fields = ("created_at", "updated_at")


@admin.register(AutomotiveTestDriveRequest)
class AutomotiveTestDriveRequestAdmin(admin.ModelAdmin):
    list_display = ("name", "product", "preferred_at", "status")
    list_filter = ("status", "preferred_at")
    search_fields = ("name", "email", "phone", "product__title")
    readonly_fields = ("created_at", "updated_at")


@admin.register(AutomotiveCommission)
class AutomotiveCommissionAdmin(admin.ModelAdmin):
    list_display = (
        "sale_reference",
        "product",
        "sale_amount",
        "commission_amount",
        "status",
        "sold_at",
    )
    list_filter = ("status", "sold_at")
    search_fields = ("sale_reference", "product__title", "seller__username")
    readonly_fields = (
        "commission_rate",
        "commission_amount",
        "seller_net_amount",
        "settled_at",
        "settled_by",
    )