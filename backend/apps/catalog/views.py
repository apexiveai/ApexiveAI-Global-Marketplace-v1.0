
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Product
from apps.catalog.serializers import ProductSerializer
from apps.sellers.permissions import IsApprovedSeller, IsMarketplaceAdmin


def is_marketplace_admin(user):
    return (
        user.is_authenticated
        and user.is_active
        and user.is_staff
        and user.role in ("ADMIN", "SUPER_ADMIN")
    )


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    lookup_field = "id"

    def get_permissions(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), IsApprovedSeller()]

        return [AllowAny()]

    def get_queryset(self):
        queryset = Product.objects.select_related(
            "seller",
            "category",
        )

        user = self.request.user

        if is_marketplace_admin(user):
            return queryset.order_by("-created_at")

        if user.is_authenticated and user.role == "SELLER":
            return queryset.filter(
                seller=user
            ).order_by("-created_at")

        return queryset.filter(
            status="APPROVED"
        ).order_by("-published_at", "-created_at")

    def perform_destroy(self, instance):
        user = self.request.user

        if instance.seller_id != user.id and not is_marketplace_admin(user):
            raise PermissionDenied(
                "You can only delete your own products."
            )

        instance.status = "ARCHIVED"
        instance.save(update_fields=["status", "updated_at"])


class PendingProductListView(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsMarketplaceAdmin]

    def get_queryset(self):
        return Product.objects.filter(
            status="PENDING_REVIEW"
        ).select_related(
            "seller",
            "category",
        ).order_by("created_at")


class ProductModerationView(APIView):
    permission_classes = [IsAuthenticated, IsMarketplaceAdmin]

    def post(self, request, product_id, action):
        product = get_object_or_404(
            Product.objects.select_related("seller", "category"),
            id=product_id,
        )

        if product.status != "PENDING_REVIEW":
            return Response(
                {
                    "detail": "Only pending products can be moderated."
                },
                status=status.HTTP_409_CONFLICT,
            )

        if action == "approve":
            self.validate_product_specification(product)

            product.status = "APPROVED"
            product.rejection_reason = ""
            product.published_at = timezone.now()

        elif action == "reject":
            reason = str(request.data.get("reason", "")).strip()

            if not reason:
                raise ValidationError({
                    "reason": "A rejection reason is required."
                })

            product.status = "REJECTED"
            product.rejection_reason = reason
            product.published_at = None

        else:
            return Response(
                {"detail": "Invalid moderation action."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product.full_clean()
        product.save(
            update_fields=[
                "status",
                "rejection_reason",
                "published_at",
                "updated_at",
            ]
        )

        return Response(
            ProductSerializer(
                product,
                context={"request": request},
            ).data,
            status=status.HTTP_200_OK,
        )

    @staticmethod
    def validate_product_specification(product):
        business_type = product.business_type

        if business_type == "ELECTRONICS":
            from apps.electronics.models import ElectronicsSpecification

            exists = ElectronicsSpecification.objects.filter(
                product=product
            ).exists()

        elif business_type == "JEWELRY":
            from apps.jewelry.models import JewelrySpecification

            exists = JewelrySpecification.objects.filter(
                product=product
            ).exists()

        elif business_type == "AUTOMOTIVE":
            from apps.automotive.models import AutomotiveSpecification

            exists = AutomotiveSpecification.objects.filter(
                product=product
            ).exists()

        else:
            exists = False

        if not exists:
            raise ValidationError({
                "specification": (
                    "Add the required product specification before approval."
                )
            })
