
from django.conf import settings
from django.db import models


class SellerProfile(models.Model):
    class Country(models.TextChoices):
        MYANMAR = "MM", "Myanmar"
        OTHER = "OTHER", "Other"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="seller_profile",
    )

    business_name = models.CharField(max_length=255, blank=True)
    legal_name = models.CharField(max_length=255, blank=True)
    registration_number = models.CharField(max_length=100, blank=True)

    country = models.CharField(
        max_length=10,
        choices=Country.choices,
        default=Country.MYANMAR,
    )

    city = models.CharField(max_length=120, blank=True)
    address = models.TextField(blank=True)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    contact_phone = models.CharField(max_length=30, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.business_name or self.user.username


class SellerReviewLog(models.Model):
    class Action(models.TextChoices):
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        SUSPENDED = "SUSPENDED", "Suspended"

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="seller_review_logs",
    )

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="seller_actions_performed",
    )

    action = models.CharField(
        max_length=20,
        choices=Action.choices,
    )

    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.seller.username} - {self.action}"
