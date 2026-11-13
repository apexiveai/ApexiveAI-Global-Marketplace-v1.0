
from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.media.models import VideoAsset
from apps.media.serializers import VideoAssetSerializer
from apps.sellers.permissions import IsApprovedSeller, IsMarketplaceAdmin


def is_marketplace_admin(user):
    return (
        user.is_authenticated
        and user.is_active
        and user.is_staff
        and user.role in ("ADMIN", "SUPER_ADMIN")
    )


class VideoListCreateView(generics.ListCreateAPIView):
    serializer_class = VideoAssetSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated(), IsApprovedSeller()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user

        queryset = VideoAsset.objects.select_related(
            "product",
            "product__seller",
        )

        if is_marketplace_admin(user):
            return queryset.order_by("-created_at")

        return queryset.filter(
            product__seller=user
        ).order_by("-created_at")


class VideoDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = VideoAssetSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        return VideoAsset.objects.select_related(
            "product",
            "product__seller",
        )

    def get_object(self):
        video = get_object_or_404(
            self.get_queryset(),
            id=self.kwargs["video_id"],
        )

        user = self.request.user

        if (
            video.product.seller_id != user.id
            and not is_marketplace_admin(user)
        ):
            raise PermissionDenied(
                "You do not have permission to access this video."
            )

        return video


class PendingVideoListView(generics.ListAPIView):
    serializer_class = VideoAssetSerializer
    permission_classes = [IsAuthenticated, IsMarketplaceAdmin]

    def get_queryset(self):
        return VideoAsset.objects.filter(
            status="PENDING_REVIEW"
        ).select_related(
            "product",
            "product__seller",
        ).order_by("created_at")


class VideoModerationView(APIView):
    permission_classes = [IsAuthenticated, IsMarketplaceAdmin]

    def post(self, request, video_id, action):
        video = get_object_or_404(
            VideoAsset.objects.select_related(
                "product",
                "product__seller",
            ),
            id=video_id,
        )

        if video.status != "PENDING_REVIEW":
            return Response(
                {
                    "detail": "Only pending videos can be moderated."
                },
                status=status.HTTP_409_CONFLICT,
            )

        if action == "approve":
            video.status = "APPROVED"
            video.moderation_notes = ""

        elif action == "reject":
            reason = str(request.data.get("reason", "")).strip()

            if not reason:
                raise ValidationError({
                    "reason": "A rejection reason is required."
                })

            video.status = "REJECTED"
            video.moderation_notes = reason

        else:
            return Response(
                {"detail": "Invalid moderation action."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        video.full_clean()
        video.save(
            update_fields=[
                "status",
                "moderation_notes",
                "updated_at",
            ]
        )

        return Response(
            VideoAssetSerializer(
                video,
                context={"request": request},
            ).data,
            status=status.HTTP_200_OK,
        )
