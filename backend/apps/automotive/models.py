from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.utils import timezone

from apps.catalog.models import Product
from django.conf import settings


class AutomotiveSpecification(models.Model):

    class Availability(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Available"
        RESERVED = "RESERVED", "Reserved"
        SOLD = "SOLD", "Sold"

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

    availability = models.CharField(
        max_length=12,
        choices=Availability.choices,
        default=Availability.AVAILABLE,
        db_index=True,
    )

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

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.make} {self.model_name} ({self.model_year})"


class AutomotivePartnerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="automotive_partner_profile",
    )
    slug = models.SlugField(unique=True, max_length=100)
    display_name = models.CharField(max_length=180)
    tagline = models.CharField(max_length=255, blank=True)
    is_official_partner = models.BooleanField(default=False)
    commission_rate = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal("1.00"),
        validators=[MinValueValidator(Decimal("0")), MaxValueValidator(Decimal("100"))],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.user_id and self.user.role != "SELLER":
            raise ValidationError({"user": "Automotive partners must be seller accounts."})
        if self.commission_rate != Decimal("1.00"):
            raise ValidationError({"commission_rate": "Automotive partner commission is fixed at 1%."})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.display_name


class AutomotiveInquiry(models.Model):
    class Status(models.TextChoices):
        NEW = "NEW", "New"
        CONTACTED = "CONTACTED", "Contacted"
        CLOSED = "CLOSED", "Closed"

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="automotive_inquiries",
    )
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    message = models.TextField(max_length=2000)
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.NEW,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def clean(self):
        if self.product_id and self.product.business_type != "AUTOMOTIVE":
            raise ValidationError({"product": "Choose an automotive vehicle."})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Inquiry for {self.product.title} from {self.name}"


class AutomotiveTestDriveRequest(models.Model):
    class Status(models.TextChoices):
        REQUESTED = "REQUESTED", "Requested"
        CONFIRMED = "CONFIRMED", "Confirmed"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="automotive_test_drive_requests",
    )
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    preferred_at = models.DateTimeField()
    message = models.CharField(max_length=1000, blank=True)
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.REQUESTED,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["preferred_at"]

    def clean(self):
        errors = {}
        if self.product_id and self.product.business_type != "AUTOMOTIVE":
            errors["product"] = "Choose an automotive vehicle."
        if self.preferred_at and self.preferred_at <= timezone.now():
            errors["preferred_at"] = "Choose a future appointment time."
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Test drive for {self.product.title} from {self.name}"


class AutomotiveCommission(models.Model):
    class Status(models.TextChoices):
        UNPAID = "UNPAID", "Unpaid"
        PAID = "PAID", "Paid"
        CANCELLED = "CANCELLED", "Cancelled"

    product = models.OneToOneField(
        Product,
        on_delete=models.PROTECT,
        related_name="automotive_commission",
    )
    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="automotive_commissions",
    )
    sale_reference = models.CharField(max_length=100, unique=True)
    sale_amount = models.DecimalField(max_digits=18, decimal_places=2)
    commission_rate = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=Decimal("1.00"),
        editable=False,
    )
    commission_amount = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        editable=False,
    )
    seller_net_amount = models.DecimalField(
        max_digits=18,
        decimal_places=2,
        editable=False,
    )
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.UNPAID,
        db_index=True,
    )
    sold_at = models.DateTimeField(default=timezone.now)
    settled_at = models.DateTimeField(null=True, blank=True)
    settled_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="automotive_commissions_settled",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-sold_at"]

    def clean(self):
        errors = {}
        if self.product_id and self.seller_id and self.product.seller_id != self.seller_id:
            errors["seller"] = "Commission seller must own the vehicle."
        if self.product_id and self.product.business_type != "AUTOMOTIVE":
            errors["product"] = "Commission must belong to an automotive vehicle."
        if self.sale_amount is not None and self.sale_amount <= 0:
            errors["sale_amount"] = "Sale amount must be greater than zero."
        if self.status == self.Status.PAID and not self.settled_at:
            errors["settled_at"] = "A paid commission must have a settlement date."
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.commission_rate = Decimal("1.00")
        if self.sale_amount is not None:
            self.commission_amount = (
                self.sale_amount * self.commission_rate / 100
            ).quantize(Decimal("0.01"))
            self.seller_net_amount = self.sale_amount - self.commission_amount
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.sale_reference} - {self.commission_amount}"