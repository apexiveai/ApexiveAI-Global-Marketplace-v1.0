from django.contrib import admin

from .models import Category, Product


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "business_type",
        "parent",
        "is_active",
        "display_order",
    )

    list_filter = ("business_type", "is_active")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "seller",
        "business_type",
        "price",
        "currency",
        "status",
        "created_at",
    )

    list_filter = (
        "business_type",
        "status",
        "condition",
        "currency",
    )

    search_fields = (
        "title",
        "sku",
        "seller__username",
    )

    readonly_fields = (
        "id",
        "created_at",
        "updated_at",
    )