"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import JewelryGallery from "@/components/jewelry/JewelryGallery";
import JewelrySellerCard from "@/components/jewelry/JewelrySellerCard";
import JewelrySpecifications from "@/components/jewelry/JewelrySpecifications";
import JewelryVideoPlayer from "@/components/jewelry/JewelryVideoPlayer";
import {
  formatJewelryPrice,
  getJewelryProduct,
  getJewelryVideoUrl,
  jewelryErrorMessage,
  type JewelryProduct,
} from "@/lib/jewelry-api";

export default function JewelryProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<JewelryProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getJewelryProduct(slug)
      .then((result) => {
        if (!active) return;
        if (!result) {
          setError("This jewelry piece is not available.");
          return;
        }
        setProduct(result);
      })
      .catch((requestError: unknown) => {
        if (active) setError(jewelryErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="market-container min-h-[70vh] py-10">
        <div className="grid animate-pulse gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div className="aspect-[4/3] rounded-3xl bg-white/[0.04]" />
          <div className="h-96 rounded-3xl bg-white/[0.04]" />
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="market-container min-h-[70vh] py-10">
        <Link
          href="/jewelry/shop"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft size={14} /> Back to jewelry
        </Link>
        <div
          role="alert"
          className="mt-7 rounded-2xl border border-red-300/20 bg-red-300/[0.05] p-5 text-sm text-red-100"
        >
          {error || "This jewelry piece is not available."}
        </div>
      </main>
    );
  }

  const spec = product.jewelry_specification;
  const video =
    product.videos?.find((item) => item.is_primary) ?? product.videos?.[0];

  return (
    <main className="market-container min-h-screen py-10 sm:py-14">
      <Link
        href="/jewelry/shop"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white"
      >
        <ArrowLeft size={14} /> Back to jewelry
      </Link>
      <div className="mt-7 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
        <JewelryGallery product={product} />
        <div>
          <p className="text-[9px] tracking-[0.18em] text-amber-200">
            {product.category_name || "FINE JEWELRY"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-white sm:text-4xl">
            {product.title}
          </h1>
          <p className="mt-4 text-xl font-semibold text-amber-100">
            {formatJewelryPrice(product.price, product.currency)}
          </p>
          <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-400">
            {product.description}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-[#10141b] p-4">
              <p className="text-[9px] tracking-[0.12em] text-slate-500">
                MATERIAL
              </p>
              <p className="mt-2 text-xs text-white">
                {spec?.purity || spec?.metal_type || "See specifications"}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#10141b] p-4">
              <p className="text-[9px] tracking-[0.12em] text-slate-500">
                AVAILABILITY
              </p>
              <p className="mt-2 text-xs text-white">
                {product.stock_quantity > 0 ? "In stock" : "Out of stock"}
              </p>
            </div>
          </div>
          <Link
            href={`/jewelry/store/${encodeURIComponent(product.seller_username)}`}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-amber-300 px-6 py-3.5 text-xs font-semibold text-[#17120a] transition hover:bg-white"
          >
            Contact seller <ArrowUpRight size={14} />
          </Link>
          <div className="mt-6">
            <JewelrySellerCard product={product} />
          </div>
        </div>
      </div>
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <JewelrySpecifications product={product} />
        {video && (
          <JewelryVideoPlayer
            src={getJewelryVideoUrl(video.url)}
            title={product.title}
          />
        )}
      </div>
    </main>
  );
}
