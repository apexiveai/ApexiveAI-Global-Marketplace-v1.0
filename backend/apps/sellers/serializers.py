
from rest_framework import serializers

from .models import SellerProfile, SellerReviewLog


class SellerProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    seller_status = serializers.CharField(
        source="user.seller_status",
        read_only=True,
    )

    business_type = serializers.CharField(
        source="user.business_type",
        read_only=True,
    )

    class Meta:
        model = SellerProfile
        fields = [
            "id",
            "username",
            "email",
            "business_type",
            "seller_status",
            "business_name",
            "legal_name",
            "registration_number",
            "country",
            "city",
            "address",
            "description",
            "website",
            "contact_phone",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "username",
            "email",
            "business_type",
            "seller_status",
            "created_at",
            "updated_at",
        ]


class SellerReviewLogSerializer(serializers.ModelSerializer):
    seller_username = serializers.CharField(
        source="seller.username",
        read_only=True,
    )

    reviewer_username = serializers.CharField(
        source="reviewed_by.username",
        read_only=True,
    )

    class Meta:
        model = SellerReviewLog
        fields = [
            "id",
            "seller_username",
            "reviewer_username",
            "action",
            "reason",
            "created_at",
        ]
        read_only_fields = fields
