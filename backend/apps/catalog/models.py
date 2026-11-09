import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from django.utils.text import slugify
from apps.catalog.validators import validate_product_image

class BusinessType(models.TextChoices):
    ELECTRONICS = "ELECTRONICS", "Electronics"
    JEWELRY = "JEWELRY", "Jewelry"
    AUTOMOTIVE = "AUTOMOTIVE", "Automotive"


class Category(models.Model):
    business_type = models.CharField(
        max_length=20,
        choices=BusinessType.choices,
        db_index=True,
    )
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=150)
    description = models.TextField(blank=True)

    parent = models.ForeignKey(
        "self",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="children",
    )

    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["business_type", "display_order", "name"]
        constraints = [
            models.UniqueConstraint(
                fields=["business_type", "slug"],
                name="unique_category_slug_per_business",
            ),
        ]
        indexes = [
            models.Index(fields=["business_type", "is_active"]),
        ]

    def clean(self):
        if self.parent_id:
            if self.parent.business_type != self.business_type:
                raise ValidationError(
                    {"parent": "Parent category must belong to the same business type."}
                )

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.business_type} / {self.name}"


class Product(models.Model):

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PENDING_REVIEW = "PENDING_REVIEW", "Pending Review"
        APPROVED = "APPROVED", "Approved"
        REJECTED = "REJECTED", "Rejected"
        SUSPENDED = "SUSPENDED", "Suspended"
        ARCHIVED = "ARCHIVED", "Archived"

    class Condition(models.TextChoices):
        NEW = "NEW", "Brand New"
        LIKE_NEW = "LIKE_NEW", "Like New"
        USED = "USED", "Used"
        REFURBISHED = "REFURBISHED", "Refurbished"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    seller = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="marketplace_products",
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
    )

    business_type = models.CharField(
        max_length=20,
        choices=BusinessType.choices,
        db_index=True,
    )

    sku = models.CharField(max_length=80)
    title = models.CharField(max_length=250)
    slug = models.SlugField(max_length=280)
    description = models.TextField()

    price = models.DecimalField(
        max_digits=18,
        decimal_places=2,
    )

    currency = models.CharField(max_length=3)

    stock_quantity = models.PositiveIntegerField(default=0)

    condition = models.CharField(
        max_length=20,
        choices=Condition.choices,
        default=Condition.NEW,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )

    rejection_reason = models.TextField(blank=True)

    is_featured = models.BooleanField(default=False)

    published_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["seller", "sku"],
                name="unique_product_sku_per_seller",
            ),
            models.UniqueConstraint(
                fields=["seller", "slug"],
                name="unique_product_slug_per_seller",
            ),
            models.CheckConstraint(
                condition=Q(price__gt=0),
                name="product_price_must_be_positive",
            ),
        ]
        indexes = [
            models.Index(fields=["business_type", "status"]),
            models.Index(fields=["seller", "status"]),
            models.Index(fields=["category", "status"]),
            models.Index(fields=["created_at"]),
        ]

    def clean(self):
        errors = {}

        if self.category_id:
            if self.category.business_type != self.business_type:
                errors["category"] = (
                    "Category business type must match product business type."
                )

        if self.seller_id:
            if self.seller.role != "SELLER":
                errors["seller"] = "Product owner must have Seller role."

        if self.currency:
            self.currency = self.currency.upper()

            if len(self.currency) != 3:
                errors["currency"] = "Currency must be a 3-letter code."

        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)

        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ProductImage(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="images",
    )

    image = models.ImageField(
        upload_to="products/%Y/%m/",
        validators=[validate_product_image],
    )

    alt_text = models.CharField(
        max_length=255,
        blank=True,
    )

    display_order = models.PositiveIntegerField(default=0)

    is_primary = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["display_order", "created_at"]
        indexes = [
            models.Index(fields=["product", "display_order"]),
        ]

    def clean(self):
        super().clean()

        if self.is_primary and self.product_id:
            ProductImage.objects.filter(
                product_id=self.product_id,
                is_primary=True,
            ).exclude(pk=self.pk).update(is_primary=False)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Image for {self.product.title}"
