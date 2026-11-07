
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.accounts.models import User
from apps.sellers.models import SellerProfile, SellerReviewLog
from apps.catalog.models import Product, Category
from apps.jewelry.models import JewelrySpecification
from apps.automotive.models import AutomotiveSpecification
from apps.media.models import VideoAsset
from apps.media.services import inspect_uploaded_video


class Command(BaseCommand):
    help = "Create demo Jewelry and Automotive marketplace data."

    def handle(self, *args, **options):
        try:
            admin = User.objects.get(
                username="apexiveai-superadmin"
            )
        except User.DoesNotExist:
            raise CommandError(
                "Super Admin account apexiveai-superadmin was not found."
            )

        if not admin.is_staff or admin.role not in (
            "ADMIN",
            "SUPER_ADMIN",
        ):
            raise CommandError(
                "The selected account must be an active staff Admin."
            )

        jewelry_seller = self.get_seller("JewelryStore")
        auto_seller = self.get_seller("theinzawhtwe")

        root = Path(settings.BASE_DIR).parent / "sample_assets" / "videos"

        jewelry_video = root / "jewelry" / "jewelry-showcase.mp4"
        auto_video = root / "automotive" / "black-car-showroom.mp4"

        for path in (jewelry_video, auto_video):
            if not path.is_file():
                raise CommandError(
                    f"Required sample video not found: {path}"
                )

        with transaction.atomic():
            self.approve_seller(jewelry_seller, admin)
            self.approve_seller(auto_seller, admin)

            jewelry_product = self.create_jewelry_product(
                jewelry_seller
            )

            auto_product = self.create_automotive_product(
                auto_seller
            )

            self.create_video(jewelry_product, jewelry_video)
            self.create_video(auto_product, auto_video)

        self.stdout.write(self.style.SUCCESS(
            "\nDemo Marketplace seed completed."
        ))

        self.stdout.write(
            f"Jewelry Product: {jewelry_product.id}"
        )
        self.stdout.write(
            f"Automotive Product: {auto_product.id}"
        )

        self.stdout.write(
            "\nBoth products and videos are awaiting Admin review."
        )

    def get_seller(self, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise CommandError(
                f"Seller account not found: {username}"
            )

        if user.role != User.Role.SELLER:
            raise CommandError(
                f"{username} is not a Seller account."
            )

        return user

    def approve_seller(self, seller, admin):
        if not seller.is_active:
            raise CommandError(
                f"Seller {seller.username} is inactive."
            )

        SellerProfile.objects.get_or_create(
            user=seller,
            defaults={
                "business_name": (
                    "ApexiveAI Demo Jewelry Store"
                    if seller.business_type == "JEWELRY"
                    else "ApexiveAI Demo Auto Showroom"
                ),
                "legal_name": "",
                "country": "MM",
                "city": "Yangon",
                "description": (
                    "Development demonstration seller account."
                ),
            },
        )

        if seller.seller_status != User.SellerStatus.APPROVED:
            if seller.seller_status != User.SellerStatus.PENDING:
                raise CommandError(
                    f"Cannot approve {seller.username} from "
                    f"status {seller.seller_status}."
                )

            seller.seller_status = User.SellerStatus.APPROVED
            seller.save(update_fields=["seller_status", "updated_at"])

            SellerReviewLog.objects.create(
                seller=seller,
                reviewed_by=admin,
                action="APPROVED",
                reason="Approved for development demo marketplace.",
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Seller ready: {seller.username}"
            )
        )

    def create_jewelry_product(self, seller):
        category = Category.objects.get(
            slug="gold-jewelry",
            business_type="JEWELRY",
        )

        product, created = Product.objects.get_or_create(
            seller=seller,
            sku="DEMO-JEWELRY-001",
            defaults={
                "category": category,
                "business_type": "JEWELRY",
                "title": "Demo 24K Gold Necklace",
                "slug": "demo-24k-gold-necklace",
                "description": (
                    "Development demonstration listing for "
                    "a 24K gold necklace."
                ),
                "price": "1500000.00",
                "currency": "MMK",
                "stock_quantity": 1,
                "condition": "NEW",
                "status": "PENDING_REVIEW",
            },
        )

        if product.category_id != category.id:
            raise CommandError(
                "Existing demo Jewelry product has an unexpected category."
            )

        JewelrySpecification.objects.get_or_create(
            product=product,
            defaults={
                "metal_type": "GOLD",
                "purity": "24K",
                "weight_grams": "5.500",
                "gemstone": "",
                "gemstone_weight_carat": None,
                "certificate_number": "",
                "certificate_issuer": "",
                "has_certificate": False,
                "craftsmanship_details": (
                    "Premium handcrafted demo jewelry."
                ),
            },
        )

        self.stdout.write(
            f"Jewelry product {'created' if created else 'exists'}: "
            f"{product.title}"
        )

        return product

    def create_automotive_product(self, seller):
        category = Category.objects.get(
            slug="luxury-cars",
            business_type="AUTOMOTIVE",
        )

        product, created = Product.objects.get_or_create(
            seller=seller,
            sku="DEMO-AUTO-001",
            defaults={
                "category": category,
                "business_type": "AUTOMOTIVE",
                "title": "Demo Premium Luxury Sedan",
                "slug": "demo-premium-luxury-sedan",
                "description": (
                    "Development demonstration listing for "
                    "a premium luxury sedan."
                ),
                "price": "85000000.00",
                "currency": "MMK",
                "stock_quantity": 1,
                "condition": "LIKE_NEW",
                "status": "PENDING_REVIEW",
            },
        )

        if product.category_id != category.id:
            raise CommandError(
                "Existing demo Automotive product has an unexpected category."
            )

        AutomotiveSpecification.objects.get_or_create(
            product=product,
            defaults={
                "make": "Demo Manufacturer",
                "model_name": "Premium Sedan",
                "model_year": 2024,
                "mileage_km": 12000,
                "fuel_type": "PETROL",
                "transmission": "AUTOMATIC",
                "body_type": "SEDAN",
                "engine_capacity_cc": 2000,
                "exterior_color": "Obsidian Black",
                "number_of_owners": 1,
                "vin": "",
                "registration_number": "",
                "inspection_notes": (
                    "Development demo vehicle. "
                    "Specifications are illustrative, not a real vehicle."
                ),
            },
        )

        self.stdout.write(
            f"Automotive product {'created' if created else 'exists'}: "
            f"{product.title}"
        )

        return product

    def create_video(self, product, source_path):
        existing = VideoAsset.objects.filter(
            product=product,
            source_type="UPLOAD",
        ).first()

        if existing:
            self.stdout.write(
                f"Video already exists for: {product.title}"
            )
            return existing

        with source_path.open("rb") as source:
            uploaded_file = File(
                source,
                name=source_path.name,
            )

            inspection = inspect_uploaded_video(uploaded_file)

        video = VideoAsset(
            product=product,
            source_type="UPLOAD",
            duration_seconds=inspection["duration_seconds"],
            file_size=inspection["file_size"],
            mime_type=inspection["mime_type"],
            duration_verified=True,
            status="PENDING_REVIEW",
            is_primary=True,
        )

        try:
            with source_path.open("rb") as source:
                video.video_file.save(
                    source_path.name,
                    File(source, name=source_path.name),
                    save=False,
                )

            video.full_clean()
            video.save()

        except Exception:
            if video.video_file:
                video.video_file.delete(save=False)
            raise

        self.stdout.write(
            self.style.SUCCESS(
                f"Video uploaded: {product.title} "
                f"({inspection['duration_seconds']} seconds)"
            )
        )

        return video
