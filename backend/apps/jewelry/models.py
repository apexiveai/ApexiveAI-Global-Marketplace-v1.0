from django.core.exceptions import ValidationError
from django.db import models

from apps.catalog.models import Product


class JewelrySpecification(models.Model):

    class MetalType(models.TextChoices):
        GOLD = "GOLD", "Gold"
        SILVER = "SILVER", "Silver"
        PLATINUM = "PLATINUM", "Platinum"
        WHITE_GOLD = "WHITE_GOLD", "White Gold"
        ROSE_GOLD = "ROSE_GOLD", "Rose Gold"
        OTHER = "OTHER", "Other"

    class Purity(models.TextChoices):
        K24 = "24K", "24K"
        K22 = "22K", "22K"
        K18 = "18K", "18K"
        K14 = "14K", "14K"
        S925 = "925", "925 Silver"
        OTHER = "OTHER", "Other"

    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        related_name="jewelry_specification",
    )

    metal_type = models.CharField(
        max_length=20,
        choices=MetalType.choices,
    )

    purity = models.CharField(
        max_length=10,
        choices=Purity.choices,
    )

    weight_grams = models.DecimalField(
        max_digits=12,
        decimal_places=3,
    )

    gemstone = models.CharField(max_length=150, blank=True)

    gemstone_weight_carat = models.DecimalField(
        max_digits=10,
        decimal_places=3,
        null=True,
        blank=True,
    )

    certificate_number = models.CharField(max_length=150, blank=True)

    certificate_issuer = models.CharField(max_length=150, blank=True)

    has_certificate = models.BooleanField(default=False)

    craftsmanship_details = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["metal_type", "purity"]),
        ]

    def clean(self):
        errors = {}

        if self.product_id:
            if self.product.business_type != "JEWELRY":
                errors["product"] = (
                    "Jewelry specifications require a Jewelry product."
                )

        if self.weight_grams is not None and self.weight_grams <= 0:
            errors["weight_grams"] = "Weight must be greater than zero."

        if self.has_certificate and not self.certificate_number:
            errors["certificate_number"] = (
                "Certificate number is required when certificate is available."
            )

        if self.gemstone_weight_carat is not None:
            if self.gemstone_weight_carat < 0:
                errors["gemstone_weight_carat"] = "Carat cannot be negative."

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.metal_type} - {self.product.title}"