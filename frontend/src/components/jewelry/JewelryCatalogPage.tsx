"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import JewelryFilters, {
  type JewelryFilterValues,
} from "@/components/jewelry/JewelryFilters";
import JewelryProductCard from "@/components/jewelry/JewelryProductCard";
import {
  getJewelryProducts,
  jewelryErrorMessage,
  matchesJewelryCollection,
  type JewelryCollectionKey,
  type JewelryProduct,
} from "@/lib/jewelry-api";

export default function JewelryCatalogPage({
  collection,
  title,
  description,
  showFilters = true,
  limit,
}: {
  collection: JewelryCollectionKey;
  title: string;
  description: string;
  showFilters?: boolean;
  limit?: number;
}) {
  const [products, setProducts] = useState<JewelryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<JewelryFilterValues>({
    query: "",
    sort: "newest",
    metalType: "",
    purity: "",
    minPrice: "",
    maxPrice: "",
  });

  useEffect(() => {
    let active = true;
    getJewelryProducts()
      .then((result) => {
        if (active) setProducts(result);
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
  }, []);

  const visibleProducts = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesCollection = matchesJewelryCollection(product, collection);
      const searchableText = [
        product.title,
        product.description,
        product.category_name,
        product.jewelry_specification?.metal_type,
        product.jewelry_specification?.gemstone,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const price = Number(product.price);
      const minPrice = filters.minPrice ? Number(filters.minPrice) : null;
      const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : null;
      const specification = product.jewelry_specification;

      return (
        matchesCollection &&
        (!query || searchableText.includes(query)) &&
        (!filters.metalType ||
          specification?.metal_type === filters.metalType) &&
        (!filters.purity || specification?.purity === filters.purity) &&
        (minPrice === null || price >= minPrice) &&
        (maxPrice === null || price <= maxPrice)
      );
    });

    filtered.sort((first, second) => {
      if (filters.sort === "price-low") {
        return Number(first.price) - Number(second.price);
      }
      if (filters.sort === "price-high") {
        return Number(second.price) - Number(first.price);
      }
      return (
        new Date(second.published_at ?? second.created_at).getTime() -
        new Date(first.published_at ?? first.created_at).getTime()
      );
    });

    return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
  }, [collection, filters, limit, products]);

  return (
    <section className="market-container py-12 sm:py-16">
      <div className="mb-7 max-w-2xl">
        <p className="text-[9px] tracking-[0.2em] text-amber-200">
          APEXIVEAI JEWELRY
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
      </div>

      {showFilters && (
        <JewelryFilters values={filters} onChange={setFilters} />
      )}

      <div className="mb-4 mt-7 flex items-center justify-between gap-4 text-[10px] text-slate-400">
        <span>
          {loading
            ? "Loading jewelry..."
            : `${visibleProducts.length} ${
                visibleProducts.length === 1 ? "piece" : "pieces"
              }`}
        </span>
        {collection !== "all" && (
          <Link
            href="/jewelry/shop"
            className="text-amber-200 hover:text-white"
          >
            View all jewelry
          </Link>
        )}
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-300/20 bg-red-300/[0.05] p-5 text-sm text-red-100"
        >
          {error}
        </div>
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: limit ? Math.min(limit, 4) : 8 }, (_, index) => (
            <div
              key={index}
              className="aspect-[4/5] animate-pulse rounded-2xl bg-white/[0.04]"
            />
          ))}
        </div>
      ) : visibleProducts.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <JewelryProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-6 py-14 text-center">
          <p className="text-sm font-medium text-white">
            No jewelry matches this collection yet.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Try another search or explore all available pieces.
          </p>
          <Link
            href="/jewelry/shop"
            className="mt-5 inline-flex rounded-full bg-amber-300 px-5 py-3 text-[10px] font-semibold text-[#17120a] hover:bg-white"
          >
            Browse all jewelry
          </Link>
        </div>
      )}
    </section>
  );
}
