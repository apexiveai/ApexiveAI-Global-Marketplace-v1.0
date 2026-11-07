from django.contrib import admin
from .models import ElectronicsSpecification


@admin.register(ElectronicsSpecification)
class ElectronicsSpecificationAdmin(admin.ModelAdmin):
    list_display = (
        "brand",
        "model_number",
        "product",
        "warranty_months",
    )

    search_fields = ("brand", "model_number", "product__title")