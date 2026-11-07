
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from .models import SellerProfile, SellerReviewLog


class SellerApprovalTests(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_superuser(
            username="marketplace_test_admin",
            email="admin_test@example.com",
            password="Admin!Secure2026#Password",
        )

        self.admin.role = User.Role.SUPER_ADMIN
        self.admin.save()

        self.seller = User.objects.create_user(
            username="marketplace_test_seller",
            email="seller_test@example.com",
            password="Seller!Secure2026#Password",
            role=User.Role.SELLER,
            business_type=User.BusinessType.GENERAL,
        )

        SellerProfile.objects.create(
            user=self.seller,
            business_name="Test Electronics Store",
        )

    def test_admin_can_view_pending_sellers(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get(
            "/api/v1/sellers/admin/pending/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_admin_can_approve_seller(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            f"/api/v1/sellers/admin/{self.seller.id}/approve/",
            {
                "reason": "Business verification completed."
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.seller.refresh_from_db()

        self.assertEqual(
            self.seller.seller_status,
            User.SellerStatus.APPROVED,
        )

        self.assertTrue(self.seller.can_sell)

        self.assertTrue(
            SellerReviewLog.objects.filter(
                seller=self.seller,
                reviewed_by=self.admin,
                action=SellerReviewLog.Action.APPROVED,
            ).exists()
        )

    def test_admin_can_reject_seller(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            f"/api/v1/sellers/admin/{self.seller.id}/reject/",
            {
                "reason": "Business documents are incomplete."
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.seller.refresh_from_db()

        self.assertEqual(
            self.seller.seller_status,
            User.SellerStatus.REJECTED,
        )

        self.assertFalse(self.seller.can_sell)

    def test_non_admin_cannot_approve_seller(self):
        buyer = User.objects.create_user(
            username="ordinary_buyer",
            email="ordinary_buyer@example.com",
            password="Buyer!Secure2026#Password",
        )

        self.client.force_authenticate(user=buyer)

        response = self.client.post(
            f"/api/v1/sellers/admin/{self.seller.id}/approve/",
            {
                "reason": "Unauthorized attempt."
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_approved_seller_cannot_be_approved_again(self):
        self.client.force_authenticate(user=self.admin)

        first_response = self.client.post(
            f"/api/v1/sellers/admin/{self.seller.id}/approve/",
            {"reason": "Verification completed."},
            format="json",
        )

        self.assertEqual(
            first_response.status_code,
            status.HTTP_200_OK,
        )

        second_response = self.client.post(
            f"/api/v1/sellers/admin/{self.seller.id}/approve/",
            {"reason": "Duplicate approval."},
            format="json",
        )

        self.assertEqual(
            second_response.status_code,
            status.HTTP_409_CONFLICT,
        )
