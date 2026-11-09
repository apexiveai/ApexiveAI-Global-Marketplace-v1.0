"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Store } from "lucide-react";
import JewelryProductCard from "@/components/jewelry/JewelryProductCard";
import {
  getJewelryStore,
  jewelryErrorMessage,
  type JewelryStore,
} from "@/lib/jewelry-api";

export default function JewelryStorePage({
  username,
}: {
  username: string;
}) {
  const [store, setStore] = useState<JewelryStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getJewelryStore(username)
      .then((result) => {
        if (active) setStore(result);
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
  }, [username]);

  if (loading) {
    return (
      <main className="market-container min-h-[65vh] py-12">
        <div className="h-56 animate-pulse rounded-3xl bg-white/[0.04]" />
      </main>
    );
  }

  if (error || !store) {
    return (
      <main className="market-container min-h-[65vh] py-12">
        <Link
          href="/jewelry/stores"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft size={14} /> All jewelry stores
        </Link>
        <div
          role="alert"
          className="mt-7 rounded-2xl border border-red-300/20 bg-red-300/[0.05] p-5 text-sm text-red-100"
        >
          {error || "This jewelry store could not be found."}
        </div>
      </main>
    );
  }

  return (
    <main className="market-container min-h-[65vh] py-12 sm:py-16">
      <Link
        href="/jewelry/stores"
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white"
      >
        <ArrowLeft size={14} /> All jewelry stores
      </Link>
      <section className="mt-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1713] to-[#10141b] p-7 sm:p-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-200/25 bg-amber-200/[0.08] text-amber-100">
          <Store size={20} />
        </span>
        <p className="mt-5 text-[9px] tracking-[0.2em] text-amber-200">
          MARKETPLACE JEWELRY SELLER
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          {store.username}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {store.products.length} published{" "}
          {store.products.length === 1 ? "piece" : "pieces"}
        </p>
      </section>
      <section className="py-10">
        <h2 className="mb-5 text-xl font-semibold text-white">
          Available jewelry
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {store.products.map((product) => (
            <JewelryProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
