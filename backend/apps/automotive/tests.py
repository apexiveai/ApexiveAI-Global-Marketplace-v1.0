from datetime import timedelta
from decimal import Decimal

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.catalog.models import BusinessType, Category, Product

from .models import (
    AutomotiveCommission,
    AutomotiveInquiry,
    AutomotivePartnerProfile,
    AutomotiveSpecification,
    AutomotiveTestDriveRequest,
)


class AutomotiveMarketplaceTests(APITestCase):
    def setUp(self):
        self.seller = User.objects.create_user(
            username="auto_seller",
            email="auto-seller@example.com",
            password="SecurePass!2026",
            role=User.Role.SELLER,
            business_type="AUTOMOTIVE",
        )
        self.seller.seller_status = User.SellerStatus.APPROVED
        self.seller.save(update_fields=["seller_status", "updated_at"])
        self.category = Category.objects.create(
            business_type=BusinessType.AUTOMOTIVE,
            name="Luxury Cars",
            slug="automotive-luxury-cars",
        )
        self.product = Product.objects.create(
            seller=self.seller,
            category=self.category,
            business_type=BusinessType.AUTOMOTIVE,
            sku="AUTO-TEST-001",
            title="Premium Sedan",
            slug="premium-sedan",
            description="A well maintained premium sedan.",
            price=Decimal("85000000.00"),
            currency="MMK",
            stock_quantity=1,
            condition=Product.Condition.LIKE_NEW,
            status=Product.Status.APPROVED,
            published_at=timezone.now(),
        )
        AutomotiveSpecification.objects.create(
            product=self.product,
            make="Example Motors",
            model_name="Executive",
            model_year=2024,
            mileage_km=12000,
            fuel_type=AutomotiveSpecification.FuelType.PETROL,
            transmission=AutomotiveSpecification.Transmission.AUTOMATIC,
            body_type=AutomotiveSpecification.BodyType.SEDAN,
        )
        self.partner = AutomotivePartnerProfile.objects.create(
            user=self.seller,
            slug="danza",
            display_name="Danza Car Showroom",
            tagline="Premium Partner Showroom",
            is_official_partner=True,
        )

    def test_public_vehicle_catalogue_supports_vehicle_search_and_details(self):
        response = self.client.get(
            "/api/v1/automotive/vehicles/",
            {"q": "Example Motors", "year_from": "2023"},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["specification"]["make"], "Example Motors")
        self.assertNotIn("vin", response.data[0]["specification"])

        detail = self.client.get(
            f"/api/v1/automotive/vehicles/{self.product.id}/"
        )
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["partner_slug"], "danza")

    def test_partner_profile_and_inquiry_flow(self):
        partner_response = self.client.get("/api/v1/partners/danza/")
        self.assertEqual(partner_response.status_code, status.HTTP_200_OK)
        self.assertEqual(partner_response.data["display_name"], "Danza Car Showroom")

        response = self.client.post(
            f"/api/v1/automotive/vehicles/{self.product.id}/inquiries/",
            {
                "product": str(self.product.id),
                "name": "Buyer",
                "email": "buyer@example.com",
                "phone": "+959123456789",
                "message": "Is the vehicle available?",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AutomotiveInquiry.objects.count(), 1)

    def test_test_drive_rejects_past_appointments(self):
        response = self.client.post(
            f"/api/v1/automotive/vehicles/{self.product.id}/test-drives/",
            {
                "product": str(self.product.id),
                "name": "Buyer",
                "email": "buyer@example.com",
                "phone": "+959123456789",
                "preferred_at": (timezone.now() - timedelta(days=1)).isoformat(),
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(AutomotiveTestDriveRequest.objects.count(), 0)

    def test_seller_can_manage_inquiries_and_confirm_future_test_drives(self):
        inquiry = AutomotiveInquiry.objects.create(
            product=self.product,
            name="Buyer",
            email="buyer@example.com",
            phone="+959123456789",
            message="Please contact me.",
        )
        test_drive = AutomotiveTestDriveRequest.objects.create(
            product=self.product,
            name="Buyer",
            email="buyer@example.com",
            phone="+959123456789",
            preferred_at=timezone.now() + timedelta(days=2),
        )
        self.client.force_authenticate(self.seller)

        inquiry_response = self.client.patch(
            f"/api/v1/partners/danza/inquiries/{inquiry.id}/",
            {"status": AutomotiveInquiry.Status.CONTACTED},
            format="json",
        )
        self.assertEqual(inquiry_response.status_code, status.HTTP_200_OK)

        test_drive_response = self.client.patch(
            f"/api/v1/partners/danza/test-drives/{test_drive.id}/",
            {"status": AutomotiveTestDriveRequest.Status.CONFIRMED},
            format="json",
        )
        self.assertEqual(test_drive_response.status_code, status.HTTP_200_OK)
        test_drive.refresh_from_db()
        self.assertEqual(
            test_drive.status,
            AutomotiveTestDriveRequest.Status.CONFIRMED,
        )

    def test_verified_sale_records_one_percent_commission_and_settlement(self):
        admin = User.objects.create_user(
            username="market_admin",
            email="admin@example.com",
            password="SecurePass!2026",
            role=User.Role.ADMIN,
            is_staff=True,
        )
        self.client.force_authenticate(admin)
        response = self.client.post(
            "/api/v1/commissions/",
            {
                "product": str(self.product.id),
                "sale_reference": "DANZA-SALE-001",
                "sale_amount": "100000000.00",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        commission = AutomotiveCommission.objects.get(product=self.product)
        self.assertEqual(commission.commission_amount, Decimal("1000000.00"))
        self.assertEqual(commission.seller_net_amount, Decimal("99000000.00"))
        self.assertEqual(
            AutomotiveSpecification.objects.get(product=self.product).availability,
            AutomotiveSpecification.Availability.SOLD,
        )

        settlement = self.client.post(
            f"/api/v1/commissions/{commission.id}/settle/",
            {},
            format="json",
        )
        self.assertEqual(settlement.status_code, status.HTTP_200_OK)
        commission.refresh_from_db()
        self.assertEqual(commission.status, AutomotiveCommission.Status.PAID)

        ledger = self.client.get("/api/v1/commissions/ledger/")
        self.assertEqual(ledger.status_code, status.HTTP_200_OK)
        self.assertEqual(len(ledger.data), 1)

    def test_commission_recording_requires_administrator(self):
        response = self.client.post(
            "/api/v1/commissions/",
            {
                "product": str(self.product.id),
                "sale_reference": "DANZA-SALE-002",
                "sale_amount": "100000000.00",
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
