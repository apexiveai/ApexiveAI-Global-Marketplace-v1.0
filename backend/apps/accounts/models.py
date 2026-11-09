
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        BUYER = "BUYER", "Buyer"
        SELLER = "SELLER", "Seller"
        ADMIN = "ADMIN", "Admin"
        SUPER_ADMIN = "SUPER_ADMIN", "Super Admin"

    class SellerStatus(models.TextChoices):
        NOT_APPLICABLE = "NOT_APPLICABLE", "Not Applicable"
        PENDING = "PENDING", "Pending Approval"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        SUSPENDED = "SUSPENDED", "Suspended"

    class BusinessType(models.TextChoices):
        GENERAL = "GENERAL", "General Marketplace"
        JEWELRY = "JEWELRY", "Jewelry"
        AUTOMOTIVE = "AUTOMOTIVE", "Automotive"
        MULTI_CATEGORY = "MULTI_CATEGORY", "Multiple Categories"

    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=30, blank=True)

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.BUYER,
        db_index=True,
    )

    seller_status = models.CharField(
        max_length=20,
        choices=SellerStatus.choices,
        default=SellerStatus.NOT_APPLICABLE,
        db_index=True,
    )

    business_type = models.CharField(
        max_length=20,
        choices=BusinessType.choices,
        blank=True,
    )

    email_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    REQUIRED_FIELDS = ["email"]

    def save(self, *args, **kwargs):
        if self.role == self.Role.SELLER:
            if self.seller_status == self.SellerStatus.NOT_APPLICABLE:
                self.seller_status = self.SellerStatus.PENDING
        else:
            self.seller_status = self.SellerStatus.NOT_APPLICABLE

        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def can_sell(self):
        return (
            self.role == self.Role.SELLER
            and self.seller_status == self.SellerStatus.APPROVED
            and self.is_active
        )

    def __str__(self):
        return f"{self.username} ({self.role})"
