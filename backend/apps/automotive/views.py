from decimal import Decimal, InvalidOperation
from uuid import UUID

from django.db import IntegrityError, transaction
from django.db.models import Q, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import Product
from apps.sellers.permissions import IsMarketplaceAdmin

from .models import (
    AutomotiveCommission,
    AutomotiveInquiry,
    AutomotivePartnerProfile,
    AutomotiveSpecification,
    AutomotiveTestDriveRequest,
)
from .serializers import (
    AutomotiveCommissionSerializer,
    AutomotiveInquirySerializer,
    AutomotiveInquiryStatusSerializer,
    AutomotivePartnerSaleSerializer,
    AutomotivePartnerSerializer,
    AutomotiveTestDriveRequestSerializer,
    AutomotiveTestDriveStatusSerializer,
    AutomotiveVehicleSerializer,
)


def get_partner(partner_slug):
    return get_object_or_404(
        AutomotivePartnerProfile.objects.select_related(
            "user",
            "user__seller_profile",
        ),
        slug=partner_slug,
        user__is_active=True,
        user__seller_status="APPROVED",
    )


def is_admin(user):
    return bool(
        user.is_authenticated
        and user.is_active
        and user.is_staff
        and user.role in ("ADMIN", "SUPER_ADMIN")
    )


class PartnerDetailView(generics.RetrieveAPIView):
    serializer_class = AutomotivePartnerSerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"
    lookup_url_kwarg = "partner_slug"

    def get_queryset(self):
        return AutomotivePartnerProfile.objects.select_related(
            "user",
            "user__seller_profile",
        ).filter(
            user__is_active=True,
            user__seller_status="APPROVED",
        )


class VehicleQueryMixin:
    serializer_class = AutomotiveVehicleSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(
            business_type="AUTOMOTIVE",
            status=Product.Status.APPROVED,
            automotive_specification__availability__in=[
                AutomotiveSpecification.Availability.AVAILABLE,
                AutomotiveSpecification.Availability.RESERVED,
            ],
        ).select_related(
            "seller",
            "seller__seller_profile",
            "seller__automotive_partner_profile",
            "automotive_specification",
        ).prefetch_related(
            "images",
            "videos",
        )

        partner_slug = self.kwargs.get("partner_slug")
        if partner_slug:
            queryset = queryset.filter(seller=get_partner(partner_slug).user)

        params = self.request.query_params
        ids = params.get("ids")
        if ids:
            requested_ids = [value.strip() for value in ids.split(",") if value.strip()]
            if not requested_ids or len(requested_ids) > 3:
                raise ValidationError({"ids": "Compare between one and three vehicles."})
            try:
                requested_ids = [UUID(value) for value in requested_ids]
            except ValueError:
                raise ValidationError({"ids": "One or more vehicle IDs are invalid."})
            queryset = queryset.filter(pk__in=requested_ids)

        query = params.get("q", "").strip()
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query)
                | Q(description__icontains=query)
                | Q(automotive_specification__make__icontains=query)
                | Q(automotive_specification__model_name__icontains=query)
            )

        filters = {
            "make": "automotive_specification__make__icontains",
            "model": "automotive_specification__model_name__icontains",
            "fuel_type": "automotive_specification__fuel_type",
            "transmission": "automotive_specification__transmission",
            "body_type": "automotive_specification__body_type",
            "availability": "automotive_specification__availability",
        }
        for param, field in filters.items():
            value = params.get(param)
            if value:
                queryset = queryset.filter(**{field: value})

        for param, lookup in (
            ("year_from", "automotive_specification__model_year__gte"),
            ("year_to", "automotive_specification__model_year__lte"),
            ("min_price", "price__gte"),
            ("max_price", "price__lte"),
        ):
            value = params.get(param)
            if value:
                try:
                    number = Decimal(value)
                    if number < 0:
                        raise InvalidOperation
                except (InvalidOperation, ValueError):
                    raise ValidationError(
                        {param: "Enter a valid non-negative number."}
                    )
                queryset = queryset.filter(**{lookup: number})

        ordering = params.get("ordering", "-published_at")
        allowed_ordering = {
            "price",
            "-price",
            "published_at",
            "-published_at",
            "automotive_specification__model_year",
            "-automotive_specification__model_year",
        }
        if ordering not in allowed_ordering:
            raise ValidationError({"ordering": "Unsupported vehicle ordering."})
        return queryset.order_by(ordering, "-id")


class VehicleListView(VehicleQueryMixin, generics.ListAPIView):
    pass


class VehicleDetailView(VehicleQueryMixin, generics.RetrieveAPIView):
    lookup_field = "id"
    lookup_url_kwarg = "vehicle_id"


class PartnerInquiryListCreateView(generics.ListCreateAPIView):
    serializer_class = AutomotiveInquirySerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["partner"] = get_partner(self.kwargs["partner_slug"])
        return context

    def get_queryset(self):
        partner = get_partner(self.kwargs["partner_slug"])
        queryset = AutomotiveInquiry.objects.filter(
            product__seller=partner.user,
        ).select_related("product")
        if is_admin(self.request.user) or self.request.user.id == partner.user_id:
            return queryset
        return queryset.none()


class PartnerTestDriveListCreateView(generics.ListCreateAPIView):
    serializer_class = AutomotiveTestDriveRequestSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["partner"] = get_partner(self.kwargs["partner_slug"])
        return context

    def get_queryset(self):
        partner = get_partner(self.kwargs["partner_slug"])
        queryset = AutomotiveTestDriveRequest.objects.filter(
            product__seller=partner.user,
        ).select_related("product")
        if is_admin(self.request.user) or self.request.user.id == partner.user_id:
            return queryset
        return queryset.none()


class VehicleInquiryListCreateView(generics.ListCreateAPIView):
    serializer_class = AutomotiveInquirySerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_vehicle(self):
        return get_object_or_404(
            Product,
            pk=self.kwargs["vehicle_id"],
            business_type="AUTOMOTIVE",
            status=Product.Status.APPROVED,
        )

    def get_queryset(self):
        vehicle = self.get_vehicle()
        if is_admin(self.request.user) or self.request.user.id == vehicle.seller_id:
            return AutomotiveInquiry.objects.filter(product=vehicle)
        return AutomotiveInquiry.objects.none()


class VehicleTestDriveListCreateView(generics.ListCreateAPIView):
    serializer_class = AutomotiveTestDriveRequestSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_vehicle(self):
        return get_object_or_404(
            Product,
            pk=self.kwargs["vehicle_id"],
            business_type="AUTOMOTIVE",
            status=Product.Status.APPROVED,
        )

    def get_queryset(self):
        vehicle = self.get_vehicle()
        if is_admin(self.request.user) or self.request.user.id == vehicle.seller_id:
            return AutomotiveTestDriveRequest.objects.filter(product=vehicle)
        return AutomotiveTestDriveRequest.objects.none()


class AutomotiveInquiryStatusView(generics.UpdateAPIView):
    serializer_class = AutomotiveInquiryStatusSerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = "inquiry_id"
    http_method_names = ["patch", "put", "head", "options"]

    def get_queryset(self):
        queryset = AutomotiveInquiry.objects.select_related("product")
        partner_slug = self.kwargs.get("partner_slug")
        if partner_slug:
            queryset = queryset.filter(product__seller=get_partner(partner_slug).user)
        if is_admin(self.request.user):
            return queryset
        return queryset.filter(product__seller=self.request.user)


class AutomotiveTestDriveStatusView(generics.UpdateAPIView):
    serializer_class = AutomotiveTestDriveStatusSerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = "request_id"
    http_method_names = ["patch", "put", "head", "options"]

    def get_queryset(self):
        queryset = AutomotiveTestDriveRequest.objects.select_related("product")
        partner_slug = self.kwargs.get("partner_slug")
        if partner_slug:
            queryset = queryset.filter(product__seller=get_partner(partner_slug).user)
        if is_admin(self.request.user):
            return queryset
        return queryset.filter(product__seller=self.request.user)


class CommissionLedgerView(generics.ListAPIView):
    serializer_class = AutomotiveCommissionSerializer
    permission_classes = [IsAuthenticated, IsMarketplaceAdmin]

    def get_queryset(self):
        queryset = AutomotiveCommission.objects.select_related(
            "product",
            "seller",
        )
        status_value = self.request.query_params.get("status")
        if status_value:
            if status_value not in AutomotiveCommission.Status.values:
                raise ValidationError({"status": "Unsupported commission status."})
            queryset = queryset.filter(status=status_value)
        return queryset


class CommissionRecordView(APIView):
    permission_classes = [IsAuthenticated, IsMarketplaceAdmin]

    @transaction.atomic
    def post(self, request):
        sale_serializer = AutomotivePartnerSaleSerializer(data=request.data)
        sale_serializer.is_valid(raise_exception=True)
        product = get_object_or_404(
            Product.objects.select_for_update().select_related("seller"),
            pk=sale_serializer.validated_data["product"].pk,
            business_type="AUTOMOTIVE",
            status=Product.Status.APPROVED,
        )
        specification = get_object_or_404(
            AutomotiveSpecification.objects.select_for_update(),
            product=product,
            availability=AutomotiveSpecification.Availability.AVAILABLE,
        )

        commission_serializer = AutomotiveCommissionSerializer(
            data={
                "product": product.pk,
                "sale_reference": sale_serializer.validated_data["sale_reference"],
                "sale_amount": sale_serializer.validated_data["sale_amount"],
            }
        )
        commission_serializer.is_valid(raise_exception=True)
        try:
            commission = commission_serializer.save()
        except IntegrityError:
            raise ValidationError({
                "sale_reference": "This sale or vehicle has already been recorded."
            })

        specification.availability = AutomotiveSpecification.Availability.SOLD
        specification.save(update_fields=["availability", "updated_at"])
        product.stock_quantity = 0
        product.save(update_fields=["stock_quantity", "updated_at"])

        return Response(
            AutomotiveCommissionSerializer(commission).data,
            status=status.HTTP_201_CREATED,
        )


class CommissionSettlementView(APIView):
    permission_classes = [IsAuthenticated, IsMarketplaceAdmin]

    @transaction.atomic
    def post(self, request, commission_id):
        commission = get_object_or_404(
            AutomotiveCommission.objects.select_for_update(),
            pk=commission_id,
        )
        if commission.status != AutomotiveCommission.Status.UNPAID:
            raise ValidationError({"status": "Only unpaid commissions can be settled."})
        commission.status = AutomotiveCommission.Status.PAID
        commission.settled_at = timezone.now()
        commission.settled_by = request.user
        commission.save(update_fields=["status", "settled_at", "settled_by"])
        return Response(AutomotiveCommissionSerializer(commission).data)


class CommissionSettlementListView(CommissionLedgerView):
    def get_queryset(self):
        return super().get_queryset().filter(
            status=AutomotiveCommission.Status.PAID,
        )


class AutomotiveAdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsMarketplaceAdmin]

    def get(self, request, partner_slug):
        partner = get_partner(partner_slug)
        vehicles = Product.objects.filter(
            seller=partner.user,
            business_type="AUTOMOTIVE",
        )
        commissions = AutomotiveCommission.objects.filter(seller=partner.user)
        totals = commissions.aggregate(
            sales=Sum("sale_amount"),
            commission=Sum("commission_amount"),
            payout=Sum("seller_net_amount"),
        )
        return Response({
            "partner": AutomotivePartnerSerializer(partner).data,
            "vehicles": {
                "total": vehicles.count(),
                "pending_review": vehicles.filter(status="PENDING_REVIEW").count(),
                "published": vehicles.filter(status="APPROVED").count(),
            },
            "inquiries": AutomotiveInquiry.objects.filter(
                product__seller=partner.user,
                status=AutomotiveInquiry.Status.NEW,
            ).count(),
            "test_drives": AutomotiveTestDriveRequest.objects.filter(
                product__seller=partner.user,
                status=AutomotiveTestDriveRequest.Status.REQUESTED,
            ).count(),
            "commissions": {
                "sales_total": totals["sales"] or Decimal("0.00"),
                "commission_total": totals["commission"] or Decimal("0.00"),
                "seller_payout_total": totals["payout"] or Decimal("0.00"),
                "unpaid": commissions.filter(
                    status=AutomotiveCommission.Status.UNPAID
                ).count(),
                "paid": commissions.filter(
                    status=AutomotiveCommission.Status.PAID
                ).count(),
            },
        })
