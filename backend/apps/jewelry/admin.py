from django.contrib import admin
from .models import JewelrySpecification


@admin.register(JewelrySpecification)
class JewelrySpecificationAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "metal_type",
        "purity",
        "weight_grams",
        "has_certificate",
    )

    list_filter = ("metal_type", "purity", "has_certificate")
    search_fields = ("product__title", "certificate_number")