from django.contrib import admin
from .models import AutomotiveSpecification


@admin.register(AutomotiveSpecification)
class AutomotiveSpecificationAdmin(admin.ModelAdmin):
    list_display = (
        "make",
        "model_name",
        "model_year",
        "fuel_type",
        "transmission",
        "product",
    )

    list_filter = ("fuel_type", "transmission", "body_type")
    search_fields = ("make", "model_name", "vin", "product__title")