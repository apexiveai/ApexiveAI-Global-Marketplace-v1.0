
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class MarketplaceUserAdmin(UserAdmin):
    model = User

    list_display = (
        "username",
        "email",
        "role",
        "seller_status",
        "is_active",
        "is_staff",
    )

    list_filter = (
        "role",
        "seller_status",
        "is_active",
        "email_verified",
    )

    fieldsets = UserAdmin.fieldsets + (
        (
            "Marketplace Information",
            {
                "fields": (
                    "phone_number",
                    "role",
                    "seller_status",
                    "business_type",
                    "email_verified",
                )
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Marketplace Information",
            {
                "fields": (
                    "email",
                    "role",
                    "business_type",
                )
            },
        ),
    )
