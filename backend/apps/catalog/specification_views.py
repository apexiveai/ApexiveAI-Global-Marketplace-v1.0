
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, DestroyAPIView

from apps.catalog.models import Product, ProductImage
from apps.catalog.specification_serializers import (
    ElectronicsSpecificationSerializer,
    JewelrySpecificationSerializer,
    AutomotiveSpecificationSerializer,
    ProductImageSerializer,
)
from apps.sellers.permissions import IsApprovedSeller


def is_marketplace_admin(user):
    return (
        user.is_authenticated
        and user.is_active
        and user.is_staff
        and user.role in ("ADMIN", "SUPER_ADMIN")
    )


def get_owned_product(request, product_id):
    product = get_object_or_404(
        Product.objects.select_related("seller"),
        id=product_id,
    )

    if (
        product.seller_id != request.user.id
        and not is_marketplace_admin(request.user)
    ):
        raise PermissionDenied(
            "You do not have permission to modify this product."
        )

    return product


class ProductSpecificationView(APIView):
    permission_classes = [IsAuthenticated, IsApprovedSeller]

    def get_serializer_class(self, business_type):
        serializers_map = {
            "ELECTRONICS": ElectronicsSpecificationSerializer,
            "JEWELRY": JewelrySpecificationSerializer,
            "AUTOMOTIVE": AutomotiveSpecificationSerializer,
        }

        serializer_class = serializers_map.get(business_type)

        if not serializer_class:
            raise ValidationError({
                "business_type": "Unsupported product type."
            })

        return serializer_class

    def get(self, request, product_id):
        product = get_owned_product(request, product_id)
        serializer_class = self.get_serializer_class(
            product.business_type
        )

        try:
            specification = serializer_class.Meta.model.objects.get(
                product=product
            )
        except serializer_class.Meta.model.DoesNotExist:
            return Response(
                {"detail": "Specification has not been created yet."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(serializer_class(specification).data)

    def put(self, request, product_id):
        return self.save_specification(request, product_id, partial=False)

    def patch(self, request, product_id):
        return self.save_specification(request, product_id, partial=True)

    def save_specification(self, request, product_id, partial):
        product = get_owned_product(request, product_id)

        if product.seller_id != request.user.id:
            raise PermissionDenied(
                "Only the product owner can edit specifications."
            )

        serializer_class = self.get_serializer_class(
            product.business_type
        )

        model = serializer_class.Meta.model

        instance = model.objects.filter(
            product=product
        ).first()

        serializer = serializer_class(
            instance=instance,
            data=request.data,
            partial=partial,
        )

        serializer.is_valid(raise_exception=True)
        serializer.save(product=product)

        # Any specification change requires another product review.
        if product.status == "APPROVED":
            product.status = "PENDING_REVIEW"
            product.published_at = None
            product.save(
                update_fields=[
                    "status",
                    "published_at",
                    "updated_at",
                ]
            )

        return Response(
            serializer.data,
            status=(
                status.HTTP_200_OK
                if instance
                else status.HTTP_201_CREATED
            ),
        )


class ProductImageListCreateView(ListCreateAPIView):
    serializer_class = ProductImageSerializer
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsApprovedSeller()]

        return [AllowAny()]

    def get_product(self):
        product = get_object_or_404(
            Product.objects.select_related("seller"),
            id=self.kwargs["product_id"],
        )

        user = self.request.user

        if (
            product.status != "APPROVED"
            and (
                not user.is_authenticated
                or (
                    product.seller_id != user.id
                    and not is_marketplace_admin(user)
                )
            )
        ):
            from rest_framework.exceptions import NotFound
            raise NotFound()

        return product

    def get_queryset(self):
        product = self.get_product()
        return ProductImage.objects.filter(
            product=product
        ).order_by("display_order", "created_at")

    def perform_create(self, serializer):
        product = self.get_product()

        if product.seller_id != self.request.user.id:
            raise PermissionDenied(
                "You can only upload images to your own products."
            )

        serializer.save(product=product)

        if product.status == "APPROVED":
            product.status = "PENDING_REVIEW"
            product.published_at = None
            product.save(
                update_fields=[
                    "status",
                    "published_at",
                    "updated_at",
                ]
            )


class ProductImageDeleteView(DestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductImageSerializer
    lookup_field = "id"
    lookup_url_kwarg = "image_id"

    def get_queryset(self):
        return ProductImage.objects.select_related(
            "product",
            "product__seller",
        )

    def perform_destroy(self, instance):
        user = self.request.user

        if (
            instance.product.seller_id != user.id
            and not is_marketplace_admin(user)
        ):
            raise PermissionDenied(
                "You cannot delete another seller's image."
            )

        product = instance.product

        instance.image.delete(save=False)
        instance.delete()

        if product.status == "APPROVED":
            product.status = "PENDING_REVIEW"
            product.published_at = None
            product.save(
                update_fields=[
                    "status",
                    "published_at",
                    "updated_at",
                ]
            )
