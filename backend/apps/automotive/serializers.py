from django.core.exceptions import ObjectDoesNotExist, ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from apps.catalog.models import Product
from apps.catalog.specification_serializers import ProductImageSerializer
from apps.media.models import VideoAsset

from .models import (
    AutomotiveCommission,
    AutomotiveInquiry,
    AutomotivePartnerProfile,
    AutomotiveSpecification,
    AutomotiveTestDriveRequest,
)


class PublicVehicleSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomotiveSpecification
        exclude = ["id", "product", "vin", "registration_number", "inspection_notes"]


class AutomotivePartnerSerializer(serializers.ModelSerializer):
    city = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    contact_phone = serializers.SerializerMethodField()

    class Meta:
        model = AutomotivePartnerProfile
        fields = [
            "slug",
            "display_name",
            "tagline",
            "is_official_partner",
            "commission_rate",
            "city",
            "description",
            "contact_phone",
        ]

    def get_seller_profile_value(self, partner, field):
        try:
            return getattr(partner.user.seller_profile, field)
        except ObjectDoesNotExist:
            return ""

    def get_city(self, partner):
        return self.get_seller_profile_value(partner, "city")

    def get_description(self, partner):
        return self.get_seller_profile_value(partner, "description")

    def get_contact_phone(self, partner):
        return self.get_seller_profile_value(partner, "contact_phone")


class AutomotiveVehicleSerializer(serializers.ModelSerializer):
    specification = PublicVehicleSpecificationSerializer(
        source="automotive_specification",
        read_only=True,
    )
    images = ProductImageSerializer(many=True, read_only=True)
    videos = serializers.SerializerMethodField()
    seller_username = serializers.CharField(source="seller.username", read_only=True)
    seller_name = serializers.SerializerMethodField()
    partner_slug = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "price",
            "currency",
            "condition",
            "stock_quantity",
            "published_at",
            "seller_username",
            "seller_name",
            "partner_slug",
            "specification",
            "images",
            "videos",
        ]

    def get_seller_name(self, product):
        try:
            partner = product.seller.automotive_partner_profile
        except ObjectDoesNotExist:
            partner = None
        if partner:
            return partner.display_name
        try:
            return product.seller.seller_profile.business_name or product.seller.username
        except ObjectDoesNotExist:
            return product.seller.username

    def get_partner_slug(self, product):
        try:
            return product.seller.automotive_partner_profile.slug
        except ObjectDoesNotExist:
            return None

    def get_videos(self, product):
        request = self.context.get("request")
        results = []
        for video in product.videos.all():
            if video.status != VideoAsset.Status.APPROVED:
                continue
            url = video.external_url or (video.video_file.url if video.video_file else "")
            if request and url and not url.startswith(("http://", "https://")):
                url = request.build_absolute_uri(url)
            results.append({
                "id": str(video.id),
                "url": url,
                "duration_seconds": video.duration_seconds,
                "is_primary": video.is_primary,
            })
        return results


class AutomotiveInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomotiveInquiry
        fields = [
            "id",
            "product",
            "name",
            "email",
            "phone",
            "message",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def validate_product(self, product):
        if product.business_type != "AUTOMOTIVE" or product.status != "APPROVED":
            raise serializers.ValidationError("Choose an available automotive listing.")
        partner = self.context.get("partner")
        if partner and product.seller_id != partner.user_id:
            raise serializers.ValidationError("This vehicle is not listed by this showroom.")
        return product

    def create(self, validated_data):
        instance = self.Meta.model(**validated_data)
        try:
            instance.save()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                getattr(exc, "message_dict", {"detail": exc.messages})
            )
        return instance


class AutomotiveTestDriveRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomotiveTestDriveRequest
        fields = [
            "id",
            "product",
            "name",
            "email",
            "phone",
            "preferred_at",
            "message",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def validate_product(self, product):
        if product.business_type != "AUTOMOTIVE" or product.status != "APPROVED":
            raise serializers.ValidationError("Choose an available automotive listing.")
        partner = self.context.get("partner")
        if partner and product.seller_id != partner.user_id:
            raise serializers.ValidationError("This vehicle is not listed by this showroom.")
        return product

    def create(self, validated_data):
        instance = self.Meta.model(**validated_data)
        try:
            instance.save()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                getattr(exc, "message_dict", {"detail": exc.messages})
            )
        return instance


class AutomotiveInquiryStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomotiveInquiry
        fields = ["status"]

    def validate_status(self, value):
        transitions = {
            AutomotiveInquiry.Status.NEW: {
                AutomotiveInquiry.Status.CONTACTED,
                AutomotiveInquiry.Status.CLOSED,
            },
            AutomotiveInquiry.Status.CONTACTED: {
                AutomotiveInquiry.Status.CLOSED,
            },
            AutomotiveInquiry.Status.CLOSED: set(),
        }
        if value not in transitions[self.instance.status]:
            raise serializers.ValidationError("This inquiry status transition is not allowed.")
        return value


class AutomotiveTestDriveStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomotiveTestDriveRequest
        fields = ["status"]

    def validate_status(self, value):
        transitions = {
            AutomotiveTestDriveRequest.Status.REQUESTED: {
                AutomotiveTestDriveRequest.Status.CONFIRMED,
                AutomotiveTestDriveRequest.Status.CANCELLED,
            },
            AutomotiveTestDriveRequest.Status.CONFIRMED: {
                AutomotiveTestDriveRequest.Status.COMPLETED,
                AutomotiveTestDriveRequest.Status.CANCELLED,
            },
            AutomotiveTestDriveRequest.Status.COMPLETED: set(),
            AutomotiveTestDriveRequest.Status.CANCELLED: set(),
        }
        if value not in transitions[self.instance.status]:
            raise serializers.ValidationError("This test-drive status transition is not allowed.")
        return value


class AutomotiveCommissionSerializer(serializers.ModelSerializer):
    product_title = serializers.CharField(source="product.title", read_only=True)
    seller_username = serializers.CharField(source="seller.username", read_only=True)

    class Meta:
        model = AutomotiveCommission
        fields = [
            "id",
            "product",
            "product_title",
            "seller",
            "seller_username",
            "sale_reference",
            "sale_amount",
            "commission_rate",
            "commission_amount",
            "seller_net_amount",
            "status",
            "sold_at",
            "settled_at",
        ]
        read_only_fields = [
            "id",
            "product_title",
            "seller",
            "seller_username",
            "commission_rate",
            "commission_amount",
            "seller_net_amount",
            "status",
            "sold_at",
            "settled_at",
        ]

    def validate_product(self, product):
        if product.business_type != "AUTOMOTIVE":
            raise serializers.ValidationError("Choose an automotive vehicle.")
        if AutomotiveCommission.objects.filter(product=product).exists():
            raise serializers.ValidationError("This vehicle sale is already recorded.")
        return product

    @transaction.atomic
    def create(self, validated_data):
        product = validated_data["product"]
        commission = AutomotiveCommission(
            **validated_data,
            seller=product.seller,
        )
        try:
            commission.save()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                getattr(exc, "message_dict", {"detail": exc.messages})
            )
        return commission


class AutomotivePartnerSaleSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    sale_reference = serializers.CharField(max_length=100)
    sale_amount = serializers.DecimalField(max_digits=18, decimal_places=2)
