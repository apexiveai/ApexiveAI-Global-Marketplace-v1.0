"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Store } from "lucide-react";
import {
  getJewelryProducts,
  jewelryErrorMessage,
  type JewelryProduct,
} from "@/lib/jewelry-api";

export default function JewelryStoreDirectory() {
  const [products, setProducts] = useState<JewelryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const stores = [...new Set(products.map((product) => product.seller_username))]
    .filter(Boolean)
    .sort((first, second) => first.localeCompare(second));

  return (
    <main className="market-container min-h-[65vh] py-12 sm:py-16">
      <p className="text-[9px] tracking-[0.2em] text-amber-200">
        MEET THE MAKERS
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">
        Jewelry stores
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
        Browse jewelry sellers and explore their currently published pieces.
      </p>

      {error ? (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-red-300/20 bg-red-300/[0.05] p-5 text-sm text-red-100"
        >
          {error}
        </div>
      ) : loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-40 animate-pulse rounded-2xl bg-white/[0.04]"
            />
          ))}
        </div>
      ) : stores.length ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((username) => {
            const count = products.filter(
              (product) => product.seller_username === username,
            ).length;

            return (
              <Link
                key={username}
                href={`/jewelry/store/${encodeURIComponent(username)}`}
                className="group rounded-2xl border border-white/10 bg-[#10141b] p-6 transition hover:border-amber-200/40"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-200/20 bg-amber-200/[0.08] text-amber-100">
                  <Store size={20} />
                </span>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-medium text-white">
                      {username}
                    </h2>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {count} {count === 1 ? "published piece" : "published pieces"}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={17}
                    className="text-amber-200 transition group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="mt-8 rounded-2xl border border-white/10 p-8 text-sm text-slate-400">
          Jewelry stores will appear here as approved listings are published.
        </p>
      )}
    </main>
  );
}
