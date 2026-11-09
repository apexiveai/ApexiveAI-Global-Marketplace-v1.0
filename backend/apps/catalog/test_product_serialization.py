from decimal import Decimal

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.catalog.models import BusinessType, Category, Product
from apps.jewelry.models import JewelrySpecification
from apps.media.models import VideoAsset


class PublicJewelryProductSerializationTests(APITestCase):
    def setUp(self):
        seller = User.objects.create_user(
            username="jewelry_test_seller",
            email="jewelry-test@example.com",
            password="test-password",
            role=User.Role.SELLER,
            business_type=BusinessType.JEWELRY,
        )
        category = Category.objects.create(
            business_type=BusinessType.JEWELRY,
            name="Gold Jewelry",
            slug="gold-jewelry-test",
        )
        self.product = Product.objects.create(
            seller=seller,
            category=category,
            business_type=BusinessType.JEWELRY,
            sku="JEWELRY-TEST-001",
            title="Test Gold Ring",
            slug="test-gold-ring",
            description="A test jewelry listing.",
            price=Decimal("1250000.00"),
            currency="MMK",
            stock_quantity=1,
            condition=Product.Condition.NEW,
            status=Product.Status.APPROVED,
            published_at=timezone.now(),
        )
        JewelrySpecification.objects.create(
            product=self.product,
            metal_type=JewelrySpecification.MetalType.GOLD,
            purity=JewelrySpecification.Purity.K24,
            weight_grams=Decimal("3.500"),
            gemstone="",
            gemstone_weight_carat=None,
            certificate_number="",
            certificate_issuer="",
            has_certificate=False,
            craftsmanship_details="Hand-finished test piece.",
        )
        VideoAsset.objects.create(
            product=self.product,
            source_type=VideoAsset.SourceType.EXTERNAL_URL,
            external_url="https://cdn.example.com/jewelry-tour.mp4",
            duration_seconds=Decimal("30.000"),
            status=VideoAsset.Status.APPROVED,
            is_primary=True,
        )
        VideoAsset.objects.create(
            product=self.product,
            source_type=VideoAsset.SourceType.EXTERNAL_URL,
            external_url="https://cdn.example.com/pending-jewelry-tour.mp4",
            duration_seconds=Decimal("30.000"),
            status=VideoAsset.Status.PENDING_REVIEW,
        )

    def test_public_product_list_includes_images_specs_and_approved_videos_only(self):
        response = self.client.get("/api/v1/catalog/products/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        product = response.data[0]
        self.assertEqual(product["id"], str(self.product.id))
        self.assertEqual(product["images"], [])
        self.assertEqual(len(product["videos"]), 1)
        self.assertEqual(
            product["videos"][0]["url"],
            "https://cdn.example.com/jewelry-tour.mp4",
        )
        self.assertEqual(
            product["jewelry_specification"]["purity"],
            JewelrySpecification.Purity.K24,
        )
