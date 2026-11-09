
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  UserRound,
  Menu,
  X,
  Heart,
  ShieldCheck,
  Truck,
  Sparkles,
  Globe2,
} from "lucide-react";

const categories = [
  {
    number: "01",
    name: "Electronics",
    description: "Technology for tomorrow.",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1000",
    href: "/electronics",
  },
  {
    number: "02",
    name: "Fine Jewelry",
    description: "Elegance without limits.",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1000",
    href: "/jewelry",
  },
  {
    number: "03",
    name: "Automotive",
    description: "Drive your next ambition.",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1000",
    href: "/automotive",
  },
];

const products = [
  {
    id: "AX-001",
    name: "Studio Wireless Headphones",
    category: "ELECTRONICS",
    price: "MMK 485,000",
    label: "FEATURED",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900",
  },
  {
    id: "AX-002",
    name: "Signature Gold Collection",
    category: "FINE JEWELRY",
    price: "MMK 1,500,000",
    label: "EXCLUSIVE",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900",
  },
  {
    id: "AX-003",
    name: "Premium Performance Sedan",
    category: "AUTOMOTIVE",
    price: "MMK 85,000,000",
    label: "SHOWROOM",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900",
  },
  {
    id: "AX-004",
    name: "Modern Smart Watch",
    category: "ELECTRONICS",
    price: "MMK 620,000",
    label: "NEW ARRIVAL",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900",
  },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Trusted Marketplace",
    description: "Seller verification and listing moderation.",
  },
  {
    icon: Truck,
    title: "Reliable Transactions",
    description: "A structured shopping experience.",
  },
  {
    icon: Globe2,
    title: "Global Discovery",
    description: "Discover products across categories.",
  },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Announcement */}
      <div className="border-b border-white/[0.06] bg-[#0d1420]">
        <div className="market-container flex min-h-9 items-center justify-center gap-2 text-center text-[10px] tracking-[0.18em] text-slate-300 sm:text-xs">
          <Sparkles size={13} className="text-sky-400" />
          DISCOVER A NEW STANDARD OF SHOPPING
          <ArrowUpRight size={13} className="text-sky-400" />
        </div>
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#080b11]/90 backdrop-blur-2xl">
        <div className="market-container flex h-[76px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-400/10">
              <span className="text-xl font-black text-sky-300">A</span>
            </div>
            <div>
              <div className="text-sm font-black tracking-[0.19em] text-white">
                APEXIVE<span className="text-sky-400">AI</span>
              </div>
              <div className="mt-0.5 text-[8px] tracking-[0.28em] text-slate-500">
                GLOBAL MARKETPLACE
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-9 text-xs font-medium text-slate-400 lg:flex">
            <a href="#collections" className="transition hover:text-white">
              Collections
            </a>
            <a href="/electronics" className="transition hover:text-white">
              Electronics
            </a>
            <a href="/jewelry" className="transition hover:text-white">
              Jewelry
            </a>
            <a href="/automotive" className="transition hover:text-white">
              Automotive
            </a>
            <a href="#about" className="transition hover:text-white">
              About Us
            </a>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href="/login"
              className="flex items-center gap-2 rounded-full px-4 py-2.5 text-xs text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <UserRound size={16} />
              Sign In
            </a>
            <a
              href="/register"
              className="flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-bold text-black transition hover:bg-sky-200"
            >
              Get Started
              <ArrowUpRight size={14} />
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-white/10 p-2 text-white lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/10 bg-[#0b1019] p-5 lg:hidden">
            <nav className="flex flex-col gap-5 text-sm text-slate-300">
              <a href="#collections" onClick={() => setMobileMenuOpen(false)}>
                Collections
              </a>
              <a href="/electronics">Electronics</a>
              <a href="/jewelry">Jewelry</a>
              <a href="/automotive">Automotive</a>
              <a href="/login">Sign In</a>
              <a href="/register" className="text-sky-300">
                Create Account
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="hero-grid relative">
        <div className="pointer-events-none absolute -right-40 top-10 h-[600px] w-[600px] rounded-full bg-sky-500/[0.09] blur-[130px]" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-violet-500/[0.08] blur-[120px]" />

        <div className="market-container relative grid min-h-[650px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/[0.07] px-4 py-2 text-[10px] tracking-[0.18em] text-sky-300">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_12px_#60a5fa]" />
              THE NEXT GENERATION MARKETPLACE
            </div>

            <h1 className="max-w-3xl text-5xl leading-[1.08] font-semibold tracking-[-0.055em] text-white sm:text-6xl xl:text-[76px]">
              Discover
              <br />
              <span className="gradient-text">Beyond Limits.</span>
            </h1>

            <p className="mt-7 max-w-lg text-sm leading-7 text-slate-400 sm:text-base">
              A destination for exceptional products. Explore premium
              electronics, fine jewelry and extraordinary automotive
              collections in one marketplace.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#collections"
                className="group flex items-center gap-3 rounded-full bg-white px-7 py-4 text-xs font-bold text-black transition hover:bg-sky-200"
              >
                Explore Marketplace
                <ArrowUpRight size={16} />
              </a>
              <a
                href="#featured"
                className="flex items-center gap-3 rounded-full border border-white/15 px-7 py-4 text-xs text-white transition hover:bg-white/5"
              >
                Discover Products
                <ArrowRight size={15} />
              </a>
            </div>

            <div className="mt-14 grid max-w-md grid-cols-3 gap-5 border-t border-white/10 pt-7">
              <div>
                <div className="text-2xl font-semibold text-white">03</div>
                <div className="mt-1 text-[9px] tracking-wider text-slate-500">
                  MAIN CATEGORIES
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-white">360°</div>
                <div className="mt-1 text-[9px] tracking-wider text-slate-500">
                  SHOPPING EXPERIENCE
                </div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-white">01</div>
                <div className="mt-1 text-[9px] tracking-wider text-slate-500">
                  DESTINATION
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative mx-auto w-full max-w-[560px]"
          >
            <div className="absolute -inset-5 rounded-[40px] bg-sky-400/[0.08] blur-3xl" />
            <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#101724] p-2 shadow-2xl shadow-black/50">
              <div
                className="relative flex min-h-[450px] flex-col justify-between overflow-hidden rounded-[24px] bg-cover bg-center p-7 sm:min-h-[510px] sm:p-9"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg,rgba(4,8,15,.05),rgba(4,8,15,.9)),url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200')",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/20 bg-black/30 px-4 py-2 text-[9px] tracking-[0.2em] text-white backdrop-blur-xl">
                    CURATED COLLECTION
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-xl">
                    <ArrowUpRight size={17} />
                  </span>
                </div>

                <div>
                  <div className="mb-3 text-[10px] tracking-[0.25em] text-sky-300">
                    APEXIVEAI SELECT
                  </div>
                  <h2 className="max-w-sm text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    Exceptional finds. Extraordinary experiences.
                  </h2>
                  <a
                    href="#collections"
                    className="mt-7 inline-flex items-center gap-2 text-xs text-white"
                  >
                    Discover collections
                    <ArrowRight size={15} />
                  </a>
                </div>
              </div>
            </div>

            <div className="glass absolute -bottom-6 -left-5 hidden rounded-2xl p-4 shadow-2xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">
                    Verified Sellers
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400">
                    A more trusted marketplace
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search */}
      <section className="relative z-20 -mt-1">
        <div className="market-container">
          <div className="glass mx-auto flex max-w-4xl flex-col gap-3 rounded-2xl p-3 shadow-2xl shadow-black/30 sm:flex-row sm:items-center sm:rounded-full sm:p-3">
            <div className="flex flex-1 items-center gap-3 px-4">
              <Search size={19} className="text-sky-300" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  document
                    .getElementById("featured")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                placeholder="Search products, brands and collections..."
                className="h-12 w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </div>
            <a
              href="#featured"
              className="flex items-center justify-center gap-2 rounded-full bg-sky-300 px-7 py-4 text-xs font-bold text-[#06101e] transition hover:bg-white"
            >
              Search Marketplace
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="collections" className="market-container py-28">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="mb-4 text-[10px] tracking-[0.25em] text-sky-300">
              EXPLORE OUR WORLD
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Discover Collections
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Three worlds. One extraordinary destination.
            </p>
          </div>
          <a
            href="#featured"
            className="flex items-center gap-2 text-xs text-slate-300 transition hover:text-sky-300"
          >
            View all products
            <ArrowUpRight size={15} />
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {categories.map((category, index) => (
            <motion.a
              href={category.href}
              key={category.name}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              className="category-card group relative min-h-[390px] overflow-hidden rounded-2xl border border-white/10 bg-[#111722]"
            >
              <div
                className="category-image absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(180deg,rgba(4,7,13,.02) 10%,rgba(4,7,13,.88) 100%),url('${category.image}')`,
                }}
              />
              <div className="absolute inset-0 bg-sky-500/0 transition duration-500 group-hover:bg-sky-500/[0.06]" />
              <div className="relative flex h-full min-h-[390px] flex-col justify-between p-7">
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-[0.2em] text-white/60">
                    {category.number} / 03
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/20 text-white backdrop-blur-md transition group-hover:bg-white group-hover:text-black">
                    <ArrowUpRight size={18} />
                  </span>
                </div>
                <div>
                  <p className="mb-2 text-[10px] tracking-[0.2em] text-sky-300">
                    APEXIVEAI COLLECTION
                  </p>
                  <h3 className="text-3xl font-semibold text-white">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-xs text-slate-300">
                    {category.description}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs text-white">
                    Explore Collection
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured" className="border-y border-white/[0.06] bg-[#0a0e16] py-24">
        <div className="market-container">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
            <div>
              <div className="mb-4 text-[10px] tracking-[0.25em] text-sky-300">
                THE APEXIVEAI EDIT
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Featured Discoveries
              </h2>
              <p className="mt-3 text-sm text-slate-400">
                A selection of products worth discovering.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              {filteredProducts.length} PRODUCTS
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="product-card group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101621] transition hover:border-sky-400/30"
              >
                <div className="relative aspect-[4/4.3] overflow-hidden bg-[#151d2b]">
                  <div
                    className="product-image absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${product.image}')`,
                    }}
                  />
                  <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-[9px] tracking-wider text-white backdrop-blur-lg">
                    {product.label}
                  </span>
                  <button
                    className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-lg transition hover:bg-white hover:text-black"
                    aria-label={`Add ${product.name} to wishlist`}
                  >
                    <Heart size={15} />
                  </button>
                  <a
                    href="/products"
                    className="absolute bottom-4 left-4 right-4 flex translate-y-3 items-center justify-center gap-2 rounded-full bg-white py-3 text-[10px] font-bold text-black opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    QUICK VIEW
                    <ArrowUpRight size={14} />
                  </a>
                </div>
                <div className="p-5">
                  <div className="text-[9px] tracking-[0.16em] text-sky-300">
                    {product.category}
                  </div>
                  <h3 className="mt-2 min-h-10 text-sm font-medium text-white">
                    {product.name}
                  </h3>
                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.08] pt-4">
                    <span className="text-xs font-semibold text-white">
                      {product.price}
                    </span>
                    <a
                      href="/products"
                      aria-label={`View ${product.name}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-sky-300 hover:text-sky-300"
                    >
                      <ArrowUpRight size={15} />
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="rounded-2xl border border-white/10 py-16 text-center">
              <Search className="mx-auto text-slate-500" size={30} />
              <p className="mt-4 text-sm text-slate-300">
                No matching products found.
              </p>
              <button
                onClick={() => setSearch("")}
                className="mt-4 text-xs text-sky-300 underline"
              >
                Clear search
              </button>
            </div>
          )}

          <div className="mt-12 text-center">
            <a
              href="/products"
              className="inline-flex items-center gap-3 rounded-full border border-white/15 px-7 py-4 text-xs text-white transition hover:border-sky-300 hover:bg-sky-300/5"
            >
              Explore All Products
              <ArrowRight size={15} />
            </a>
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section id="about" className="market-container py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <div className="mb-4 text-[10px] tracking-[0.25em] text-sky-300">
              A NEW WAY TO DISCOVER
            </div>
            <h2 className="max-w-xl text-4xl leading-tight font-semibold tracking-tight text-white sm:text-5xl">
              More than a marketplace.
              <br />
              <span className="gradient-text">A world of possibilities.</span>
            </h2>
            <p className="mt-6 max-w-lg text-sm leading-8 text-slate-400">
              ApexiveAI brings different product categories together in one
              unified destination. Our marketplace is designed to connect
              buyers and verified sellers through a modern digital experience.
            </p>
            <a
              href="/register"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-xs font-bold text-black transition hover:bg-sky-200"
            >
              Join the Marketplace
              <ArrowUpRight size={15} />
            </a>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111824] p-7 sm:p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
            <div className="relative">
              <div className="mb-10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] tracking-[0.2em] text-sky-300">
                    THE APEXIVEAI STANDARD
                  </div>
                  <div className="mt-2 text-xl font-semibold text-white">
                    Designed around trust.
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
                  <Sparkles size={22} />
                </div>
              </div>

              <div className="space-y-7">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="flex gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-300/15 bg-sky-300/[0.06] text-sky-300">
                      <benefit.icon size={19} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {benefit.title}
                      </h3>
                      <p className="mt-1 text-xs leading-6 text-slate-400">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="market-container pb-24">
        <div className="relative overflow-hidden rounded-3xl border border-sky-300/15 bg-[#101b2b] p-8 sm:p-14">
          <div className="absolute -right-20 -top-40 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <div className="mb-4 text-[10px] tracking-[0.22em] text-sky-300">
                FOR BUSINESS OWNERS
              </div>
              <h2 className="max-w-2xl text-3xl leading-tight font-semibold text-white sm:text-4xl">
                Bring your business to a wider world.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400">
                Join ApexiveAI as a seller and introduce your products to a
                growing marketplace.
              </p>
            </div>
            <a
              href="/register"
              className="flex shrink-0 items-center gap-3 rounded-full bg-sky-300 px-7 py-4 text-xs font-bold text-[#07101b] transition hover:bg-white"
            >
              Become a Seller
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#080b11]">
        <div className="market-container grid gap-12 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-400/10 text-xl font-black text-sky-300">
                A
              </div>
              <div>
                <div className="text-sm font-black tracking-[0.18em]">
                  APEXIVEAI
                </div>
                <div className="text-[8px] tracking-[0.24em] text-slate-500">
                  GLOBAL MARKETPLACE
                </div>
              </div>
            </Link>
            <p className="mt-5 max-w-xs text-xs leading-7 text-slate-500">
              A modern destination for electronics, fine jewelry and
              automotive discoveries.
            </p>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-semibold text-white">
              Marketplace
            </h4>
            <div className="space-y-4 text-xs text-slate-500">
              <a className="block hover:text-white" href="/electronics">
                Electronics
              </a>
              <a className="block hover:text-white" href="/jewelry">
                Jewelry
              </a>
              <a className="block hover:text-white" href="/automotive">
                Automotive
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-semibold text-white">
              Account
            </h4>
            <div className="space-y-4 text-xs text-slate-500">
              <a className="block hover:text-white" href="/login">
                Sign In
              </a>
              <a className="block hover:text-white" href="/register">
                Create Account
              </a>
              <a className="block hover:text-white" href="/seller">
                Seller Center
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-xs font-semibold text-white">
              Company
            </h4>
            <div className="space-y-4 text-xs text-slate-500">
              <a className="block hover:text-white" href="#about">
                About ApexiveAI
              </a>
              <a className="block hover:text-white" href="/privacy">
                Privacy Policy
              </a>
              <a className="block hover:text-white" href="/terms">
                Terms & Conditions
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.07]">
          <div className="market-container flex flex-col justify-between gap-4 py-6 text-[10px] text-slate-600 sm:flex-row sm:items-center">
            <p>© 2026 ApexiveAI Global Marketplace. All rights reserved.</p>
            <Image
              src="/copyright-bhone-htet-naing.png"
              alt="Copyright Bhone Htet Naing — all rights reserved"
              width={576}
              height={384}
              className="h-auto w-36"
            />
            <p className="tracking-[0.15em]">
              BUILT FOR A WORLD WITHOUT LIMITS
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
