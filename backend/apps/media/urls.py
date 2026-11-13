
from django.urls import path

from apps.media.views import (
    VideoListCreateView,
    VideoDetailView,
    PendingVideoListView,
    VideoModerationView,
)

urlpatterns = [
    path(
        "videos/",
        VideoListCreateView.as_view(),
        name="video-list-create",
    ),
    path(
        "videos/<uuid:video_id>/",
        VideoDetailView.as_view(),
        name="video-detail",
    ),
    path(
        "admin/pending/",
        PendingVideoListView.as_view(),
        name="admin-pending-videos",
    ),
    path(
        "admin/<uuid:video_id>/<str:action>/",
        VideoModerationView.as_view(),
        name="admin-video-moderation",
    ),
]
