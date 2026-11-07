from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from apps.catalog.models import Product


class AutomotiveSpecification(models.Model):

    class FuelType(models.TextChoices):
        PETROL = "PETROL", "Petrol"
        DIESEL = "DIESEL", "Diesel"
        ELECTRIC = "ELECTRIC", "Electric"
        HYBRID = "HYBRID", "Hybrid"
        PLUG_IN_HYBRID = "PHEV", "Plug-in Hybrid"
        LPG = "LPG", "LPG"
        OTHER = "OTHER", "Other"

    class Transmission(models.TextChoices):
        AUTOMATIC = "AUTOMATIC", "Automatic"
        MANUAL = "MANUAL", "Manual"
        CVT = "CVT", "CVT"
        OTHER = "OTHER", "Other"

    class BodyType(models.TextChoices):
        SEDAN = "SEDAN", "Sedan"
        SUV = "SUV", "SUV"
        HATCHBACK = "HATCHBACK", "Hatchback"
        PICKUP = "PICKUP", "Pickup"
        COUPE = "COUPE", "Coupe"
        VAN = "VAN", "Van"
        TRUCK = "TRUCK", "Truck"
        MOTORCYCLE = "MOTORCYCLE", "Motorcycle"
        OTHER = "OTHER", "Other"

    product = models.OneToOneField(
        Product,
        on_delete=models.CASCADE,
        related_name="automotive_specification",
    )

    make = models.CharField(max_length=120)
    model_name = models.CharField(max_length=120)

    model_year = models.PositiveIntegerField()

    mileage_km = models.PositiveBigIntegerField(default=0)

    fuel_type = models.CharField(
        max_length=20,
        choices=FuelType.choices,
    )

    transmission = models.CharField(
        max_length=20,
        choices=Transmission.choices,
    )

    body_type = models.CharField(
        max_length=20,
        choices=BodyType.choices,
        default=BodyType.OTHER,
    )

    engine_capacity_cc = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    exterior_color = models.CharField(max_length=80, blank=True)

    number_of_owners = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
    )

    vin = models.CharField(
        max_length=80,
        blank=True,
    )

    registration_number = models.CharField(
        max_length=80,
        blank=True,
    )

    inspection_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["make", "model_name"]),
            models.Index(fields=["model_year"]),
            models.Index(fields=["fuel_type"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(model_year__gte=1900),
                name="automotive_year_minimum_1900",
            ),
        ]

    def clean(self):
        errors = {}

        if self.product_id:
            if self.product.business_type != "AUTOMOTIVE":
                errors["product"] = (
                    "Automotive specifications require an Automotive product."
                )

        current_year = timezone.now().year

        if self.model_year and self.model_year > current_year + 1:
            errors["model_year"] = "Invalid vehicle model year."

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.make} {self.model_name} ({self.model_year})"