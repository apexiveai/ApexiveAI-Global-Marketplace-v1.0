
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.catalog.views import (
    ProductViewSet,
    PendingProductListView,
    ProductModerationView,
)
from apps.catalog.specification_views import (
    ProductSpecificationView,
    ProductImageListCreateView,
    ProductImageDeleteView,
)

router = DefaultRouter()
router.register(
    "products",
    ProductViewSet,
    basename="marketplace-products",
)

pending_products = PendingProductListView.as_view({
    "get": "list",
})

urlpatterns = [
    path("", include(router.urls)),
    path(
        "admin/pending/",
        pending_products,
        name="admin-pending-products",
    ),
    path(
        "admin/<uuid:product_id>/<str:action>/",
        ProductModerationView.as_view(),
        name="admin-product-moderation",
    ),
    path(
        "products/<uuid:product_id>/specification/",
        ProductSpecificationView.as_view(),
        name="product-specification",
    ),
    path(
        "products/<uuid:product_id>/images/",
        ProductImageListCreateView.as_view(),
        name="product-images",
    ),
    path(
        "product-images/<uuid:image_id>/",
        ProductImageDeleteView.as_view(),
        name="product-image-delete",
    ),
]
