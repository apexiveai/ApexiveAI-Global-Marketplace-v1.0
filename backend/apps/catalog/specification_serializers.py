
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import serializers

from apps.electronics.models import ElectronicsSpecification
from apps.jewelry.models import JewelrySpecification
from apps.automotive.models import AutomotiveSpecification
from apps.catalog.models import Product, ProductImage
from apps.catalog.validators import validate_product_image


class ValidatedSpecificationSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        instance = self.Meta.model(**validated_data)

        try:
            instance.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                getattr(exc, "message_dict", {"detail": exc.messages})
            )

        instance.save()
        return instance

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)

        try:
            instance.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                getattr(exc, "message_dict", {"detail": exc.messages})
            )

        instance.save()
        return instance


class ElectronicsSpecificationSerializer(
    ValidatedSpecificationSerializer
):
    class Meta:
        model = ElectronicsSpecification
        fields = "__all__"
        read_only_fields = ["id", "product"]


class JewelrySpecificationSerializer(
    ValidatedSpecificationSerializer
):
    class Meta:
        model = JewelrySpecification
        fields = "__all__"
        read_only_fields = ["id", "product"]


class AutomotiveSpecificationSerializer(
    ValidatedSpecificationSerializer
):
    class Meta:
        model = AutomotiveSpecification
        fields = "__all__"
        read_only_fields = ["id", "product"]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = [
            "id",
            "product",
            "image",
            "alt_text",
            "display_order",
            "is_primary",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "product",
            "created_at",
        ]

    def validate_image(self, value):
        try:
            validate_product_image(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages)

        return value

    def create(self, validated_data):
        instance = ProductImage(**validated_data)

        try:
            instance.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                getattr(exc, "message_dict", {"detail": exc.messages})
            )

        instance.save()
        return instance
