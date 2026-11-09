from django.core.exceptions import ValidationError
from django.db import models

from apps.catalog.models import Product


class ElectronicsSpecification(models.Model):

    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        related_name="electronics_specification",
    )

    brand = models.CharField(max_length=120)
    model_number = models.CharField(max_length=120, blank=True)

    processor = models.CharField(max_length=150, blank=True)
    ram_gb = models.PositiveIntegerField(null=True, blank=True)
    storage_gb = models.PositiveIntegerField(null=True, blank=True)

    operating_system = models.CharField(max_length=100, blank=True)

    warranty_months = models.PositiveIntegerField(default=0)

    color = models.CharField(max_length=80, blank=True)

    is_original = models.BooleanField(default=True)

    specifications = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["brand"]),
            models.Index(fields=["model_number"]),
        ]

    def clean(self):
        if self.product_id:
            if self.product.business_type != "ELECTRONICS":
                raise ValidationError(
                    "Electronics specifications require an Electronics product."
                )

        if self.warranty_months > 120:
            raise ValidationError(
                {"warranty_months": "Warranty cannot exceed 120 months."}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.brand} - {self.product.title}"