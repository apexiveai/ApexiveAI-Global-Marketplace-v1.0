import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import {
  formatJewelryPrice,
  getJewelryImageUrl,
  jewelryFallbackImages,
  type JewelryProduct,
} from "@/lib/jewelry-api";

function fallbackImage(product: JewelryProduct): string {
  const text = `${product.category_name} ${product.title} ${product.jewelry_specification?.gemstone ?? ""}`.toLowerCase();
  if (text.includes("diamond")) return jewelryFallbackImages.diamond;
  if (text.includes("gemstone") || text.includes("ruby") || text.includes("jade")) {
    return jewelryFallbackImages.gemstone;
  }
  if (text.includes("ring")) return jewelryFallbackImages.ring;
  if (text.includes("necklace")) return jewelryFallbackImages.necklace;
  if (text.includes("bracelet")) return jewelryFallbackImages.bracelet;
  if (text.includes("earring")) return jewelryFallbackImages.earrings;
  return jewelryFallbackImages.gold;
}

export default function JewelryProductCard({
  product,
}: {
  product: JewelryProduct;
}) {
  const primaryImage =
    product.images?.find((image) => image.is_primary) ?? product.images?.[0];
  const image = primaryImage
    ? getJewelryImageUrl(primaryImage.image)
    : fallbackImage(product);

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#10141b] transition hover:border-amber-200/40">
      <Link
        href={`/jewelry/product/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-[#191c22]"
      >
        <Image
          src={image}
          alt={primaryImage?.alt_text || product.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-[9px] tracking-[0.12em] text-white backdrop-blur">
          {product.is_featured ? "FEATURED" : product.category_name || "JEWELRY"}
        </span>
      </Link>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[9px] tracking-[0.13em] text-amber-200">
              {product.jewelry_specification?.purity ||
                product.jewelry_specification?.metal_type ||
                "FINE JEWELRY"}
            </p>
            <Link
              href={`/jewelry/product/${product.slug}`}
              className="mt-2 line-clamp-2 min-h-10 text-sm font-medium leading-5 text-white hover:text-amber-100"
            >
              {product.title}
            </Link>
          </div>
          {product.jewelry_specification?.has_certificate && (
            <BadgeCheck
              size={17}
              aria-label="Certificate details available"
              className="mt-1 shrink-0 text-emerald-300"
            />
          )}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/[0.08] pt-4">
          <span className="text-sm font-semibold text-white">
            {formatJewelryPrice(product.price, product.currency)}
          </span>
          <Link
            href={`/jewelry/product/${product.slug}`}
            aria-label={`View ${product.title}`}
            className="inline-flex items-center gap-1 text-[10px] text-amber-200 hover:text-white"
          >
            Details <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
}
