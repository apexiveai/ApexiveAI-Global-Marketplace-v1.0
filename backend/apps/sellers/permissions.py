
from rest_framework.permissions import BasePermission


class IsMarketplaceAdmin(BasePermission):
    message = "Marketplace administrator permission is required."

    def has_permission(self, request, view):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.is_staff
            and user.role in [
                "ADMIN",
                "SUPER_ADMIN",
            ]
        )


class IsApprovedSeller(BasePermission):
    message = "An approved seller account is required."

    def has_permission(self, request, view):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.is_active
            and user.role == "SELLER"
            and user.seller_status == "APPROVED"
        )
