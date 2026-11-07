
from rest_framework import status
from rest_framework.test import APITestCase

from .models import User


class BuyerRegistrationTests(APITestCase):
    def test_buyer_can_register(self):
        response = self.client.post(
            "/api/v1/accounts/register/",
            {
                "username": "buyer_test_001",
                "email": "buyer001@example.com",
                "password": "MktPlace!Secure2026#A",
                "password_confirm": "MktPlace!Secure2026#A",
                "role": "BUYER",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username="buyer_test_001")

        self.assertEqual(user.role, User.Role.BUYER)
        self.assertTrue(user.check_password("MktPlace!Secure2026#A"))


class SellerRegistrationTests(APITestCase):
    def test_seller_registers_as_pending(self):
        response = self.client.post(
            "/api/v1/accounts/register/",
            {
                "username": "seller_test_001",
                "email": "seller001@example.com",
                "password": "MktPlace!Secure2026#A",
                "password_confirm": "MktPlace!Secure2026#A",
                "role": "SELLER",
                "business_type": "GENERAL",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username="seller_test_001")

        self.assertEqual(user.role, User.Role.SELLER)
        self.assertEqual(
            user.seller_status,
            User.SellerStatus.PENDING,
        )
        self.assertFalse(user.can_sell)

        self.assertTrue(
            hasattr(user, "seller_profile")
        )
