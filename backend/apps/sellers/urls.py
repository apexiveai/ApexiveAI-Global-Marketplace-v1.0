
from django.urls import path

from .views import (
    MySellerProfileView,
    PendingSellerListView,
    SellerApprovalActionView,
    SellerReviewHistoryView,
)

app_name = "sellers"

urlpatterns = [
    path(
        "me/profile/",
        MySellerProfileView.as_view(),
        name="my-profile",
    ),

    path(
        "admin/pending/",
        PendingSellerListView.as_view(),
        name="pending-sellers",
    ),

    path(
        "admin/reviews/",
        SellerReviewHistoryView.as_view(),
        name="review-history",
    ),

    path(
        "admin/<int:pk>/<str:action>/",
        SellerApprovalActionView.as_view(),
        name="seller-review-action",
    ),
]
