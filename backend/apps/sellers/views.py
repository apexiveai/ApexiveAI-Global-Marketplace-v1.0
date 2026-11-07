
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User

from .models import SellerProfile, SellerReviewLog
from .permissions import IsMarketplaceAdmin
from .serializers import (
    SellerProfileSerializer,
    SellerReviewLogSerializer,
)


class MySellerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = SellerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user

        if user.role != User.Role.SELLER:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Seller account required.")

        profile, _ = SellerProfile.objects.get_or_create(
            user=user
        )

        return profile


class PendingSellerListView(generics.ListAPIView):
    serializer_class = SellerProfileSerializer
    permission_classes = [IsMarketplaceAdmin]

    def get_queryset(self):
        return SellerProfile.objects.filter(
            user__role=User.Role.SELLER,
            user__seller_status=User.SellerStatus.PENDING,
        ).select_related("user")


class SellerReviewHistoryView(generics.ListAPIView):
    serializer_class = SellerReviewLogSerializer
    permission_classes = [IsMarketplaceAdmin]

    def get_queryset(self):
        return SellerReviewLog.objects.select_related(
            "seller",
            "reviewed_by",
        )


class SellerApprovalActionView(APIView):
    permission_classes = [IsMarketplaceAdmin]

    @transaction.atomic
    def post(self, request, pk, action):
        seller = get_object_or_404(
            User.objects.select_for_update(),
            pk=pk,
            role=User.Role.SELLER,
        )

        reason = str(request.data.get("reason", "")).strip()

        if action == "approve":
            if seller.seller_status != User.SellerStatus.PENDING:
                return Response(
                    {"detail": "Only pending sellers can be approved."},
                    status=status.HTTP_409_CONFLICT,
                )

            seller.seller_status = User.SellerStatus.APPROVED
            log_action = SellerReviewLog.Action.APPROVED

        elif action == "reject":
            if seller.seller_status != User.SellerStatus.PENDING:
                return Response(
                    {"detail": "Only pending sellers can be rejected."},
                    status=status.HTTP_409_CONFLICT,
                )

            if not reason:
                return Response(
                    {"reason": "A rejection reason is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            seller.seller_status = User.SellerStatus.REJECTED
            log_action = SellerReviewLog.Action.REJECTED

        elif action == "suspend":
            if seller.seller_status != User.SellerStatus.APPROVED:
                return Response(
                    {"detail": "Only approved sellers can be suspended."},
                    status=status.HTTP_409_CONFLICT,
                )

            if not reason:
                return Response(
                    {"reason": "A suspension reason is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            seller.seller_status = User.SellerStatus.SUSPENDED
            log_action = SellerReviewLog.Action.SUSPENDED

        else:
            return Response(
                {"detail": "Unsupported action."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        seller.save(update_fields=["seller_status", "updated_at"])

        log = SellerReviewLog.objects.create(
            seller=seller,
            reviewed_by=request.user,
            action=log_action,
            reason=reason,
        )

        return Response(
            {
                "message": f"Seller {action} successful.",
                "seller_id": seller.id,
                "seller_username": seller.username,
                "seller_status": seller.seller_status,
                "review": SellerReviewLogSerializer(log).data,
            },
            status=status.HTTP_200_OK,
        )
