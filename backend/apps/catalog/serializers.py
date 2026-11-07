
import uuid

from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils.text import slugify

from rest_framework import serializers

from apps.catalog.models import Product


class ProductSerializer(serializers.ModelSerializer):
    seller_username = serializers.CharField(
        source="seller.username",
        read_only=True,
    )

    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    class Meta:
        model = Product
        fields = [
            "id",
            "seller",
            "seller_username",
            "category",
            "category_name",
            "business_type",
            "sku",
            "title",
            "slug",
            "description",
            "price",
            "currency",
            "stock_quantity",
            "condition",
            "status",
            "rejection_reason",
            "is_featured",
            "published_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "seller",
            "seller_username",
            "category_name",
            "slug",
            "status",
            "rejection_reason",
            "is_featured",
            "published_at",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        category = attrs.get(
            "category",
            getattr(self.instance, "category", None),
        )

        business_type = attrs.get(
            "business_type",
            getattr(self.instance, "business_type", None),
        )

        if category and business_type:
            if category.business_type != business_type:
                raise serializers.ValidationError({
                    "business_type": (
                        "Product business type must match its category."
                    )
                })

        request = self.context.get("request")

        if request and request.user.is_authenticated:
            user = request.user

            if user.business_type == "JEWELRY":
                if business_type and business_type != "JEWELRY":
                    raise serializers.ValidationError({
                        "business_type": (
                            "This seller account is registered for Jewelry."
                        )
                    })

            elif user.business_type == "AUTOMOTIVE":
                if business_type and business_type != "AUTOMOTIVE":
                    raise serializers.ValidationError({
                        "business_type": (
                            "This seller account is registered for Automotive."
                        )
                    })

        return attrs

    def create(self, validated_data):
        request = self.context["request"]

        product = Product(
            **validated_data,
            seller=request.user,
            status="PENDING_REVIEW",
        )

        product.slug = (
            f"{slugify(product.title)[:180]}-{uuid.uuid4().hex[:8]}"
        )

        try:
            product.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict)

        product.save()

        return product

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Editing an approved listing requires another admin review.
        if instance.status == "APPROVED":
            instance.status = "PENDING_REVIEW"
            instance.published_at = None

        try:
            instance.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict)

        instance.save()

        return instance
