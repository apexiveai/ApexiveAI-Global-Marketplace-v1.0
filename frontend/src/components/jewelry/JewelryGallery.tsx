"use client";

import { useState } from "react";
import Image from "next/image";
import {
  getJewelryImageUrl,
  jewelryFallbackImages,
  type JewelryProduct,
} from "@/lib/jewelry-api";

export default function JewelryGallery({
  product,
}: {
  product: JewelryProduct;
}) {
  const images = [...(product.images ?? [])].sort(
    (first, second) => Number(second.is_primary) - Number(first.is_primary),
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const selected = images[activeIndex];
  const fallback = jewelryFallbackImages.gold;
  const image = selected ? getJewelryImageUrl(selected.image) : fallback;

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-[#15171c]">
        <Image
          src={image}
          alt={selected?.alt_text || product.title}
          fill
          priority
          unoptimized
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />
        <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/60 px-3 py-2 text-[9px] text-white backdrop-blur">
          {images.length ? `${activeIndex + 1} / ${images.length}` : "Product image"}
        </span>
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {images.map((item, index) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActiveIndex(index)}
              aria-label={`View product photo ${index + 1}`}
              aria-pressed={activeIndex === index}
              className={`relative aspect-square overflow-hidden rounded-xl border ${
                activeIndex === index
                  ? "border-amber-200"
                  : "border-white/10 hover:border-white/30"
              }`}
            >
              <Image
                src={getJewelryImageUrl(item.image)}
                alt={item.alt_text || `${product.title} photo ${index + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
