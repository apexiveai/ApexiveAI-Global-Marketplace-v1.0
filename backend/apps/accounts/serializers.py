
from django.contrib.auth import password_validation
from django.db import transaction
from rest_framework import serializers

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        min_length=12,
        validators=[password_validation.validate_password],
        style={"input_type": "password"},
    )

    password_confirm = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone_number",
            "password",
            "password_confirm",
            "role",
            "business_type",
        ]
        read_only_fields = ["id"]

    def validate_email(self, value):
        email = value.strip().lower()

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return email

    def validate_role(self, value):
        if value not in [User.Role.BUYER, User.Role.SELLER]:
            raise serializers.ValidationError(
                "Public registration only supports Buyer and Seller."
            )

        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({
                "password_confirm": "Passwords do not match."
            })

        role = attrs.get("role", User.Role.BUYER)
        business_type = attrs.get("business_type", "")

        if role == User.Role.SELLER and not business_type:
            raise serializers.ValidationError({
                "business_type": "Seller business type is required."
            })

        if role == User.Role.BUYER:
            attrs["business_type"] = ""

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if user.role == User.Role.SELLER:
            from apps.sellers.models import SellerProfile

            SellerProfile.objects.create(user=user)

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    can_sell = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone_number",
            "role",
            "seller_status",
            "business_type",
            "email_verified",
            "can_sell",
            "date_joined",
            "created_at",
        ]
        read_only_fields = fields
