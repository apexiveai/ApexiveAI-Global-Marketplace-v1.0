"use client";

import Link from "next/link";
import { ArrowLeft, Gem, Diamond, Crown } from "lucide-react";

const categories = [
  { name: "Gold Jewelry", icon: Crown },
  { name: "Diamond Jewelry", icon: Diamond },
  { name: "Luxury Collections", icon: Gem },
];

export default function JewelryPage() {
  return (
    <main className="min-h-screen bg-[#08090d] text-white px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white">
          <ArrowLeft size={18} /> Back to Home
        </Link>

        <section className="py-20">
          <p className="text-amber-400 tracking-[0.3em] text-sm">
            APEXIVEAI LUXURY COLLECTION
          </p>
          <h1 className="mt-5 text-5xl md:text-7xl font-bold">
            Jewelry<span className="text-amber-400">.</span>
          </h1>
          <p className="mt-5 max-w-xl text-gray-400 text-lg">
            Explore fine gold, diamonds and exclusive jewelry collections.
          </p>
        </section>

        <div className="grid gap-5 md:grid-cols-3">
          {categories.map(({ name, icon: Icon }) => (
            <div key={name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 hover:border-amber-400/50 transition">
              <Icon size={32} className="text-amber-400" />
              <h2 className="mt-6 text-xl font-semibold">{name}</h2>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}