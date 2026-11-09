"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  { label: "Shop all", href: "/jewelry/shop" },
  { label: "Gold", href: "/jewelry/gold" },
  { label: "Diamond", href: "/jewelry/diamond" },
  { label: "Gemstones", href: "/jewelry/gemstones" },
  { label: "New arrivals", href: "/jewelry/new-arrivals" },
  { label: "Stores", href: "/jewelry/stores" },
];

export default function JewelryMegaMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#08090d]/90 backdrop-blur-xl">
      <div className="market-container flex h-[76px] items-center justify-between gap-6">
        <Link href="/jewelry" className="shrink-0">
          <span className="block text-sm font-semibold tracking-[0.2em] text-white">
            APEXIVE<span className="text-amber-300">AI</span>
          </span>
          <span className="mt-1 block text-[8px] tracking-[0.3em] text-slate-500">
            FINE JEWELRY
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-[11px] text-slate-300 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-amber-200"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/jewelry/custom"
            className="inline-flex items-center gap-1 text-amber-200 transition hover:text-white"
          >
            Custom jewelry <ArrowUpRight size={13} />
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/jewelry/offers"
            className="rounded-full border border-white/15 px-4 py-2.5 text-[10px] text-slate-200 transition hover:border-amber-200/50"
          >
            Offers
          </Link>
          <Link
            href="/"
            className="rounded-full bg-amber-300 px-4 py-2.5 text-[10px] font-semibold text-[#17120a] transition hover:bg-white"
          >
            Marketplace
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close jewelry menu" : "Open jewelry menu"}
          className="rounded-lg border border-white/10 p-2 text-white lg:hidden"
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/10 bg-[#0b0e14] px-5 py-4 lg:hidden">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 text-xs text-slate-300">
            {[...links, { label: "Offers", href: "/jewelry/offers" }, { label: "Custom jewelry", href: "/jewelry/custom" }].map(
              (link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg border border-white/[0.07] px-3 py-3 hover:border-amber-200/40 hover:text-white"
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
