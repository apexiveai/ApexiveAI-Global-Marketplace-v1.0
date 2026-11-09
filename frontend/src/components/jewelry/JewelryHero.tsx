import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function JewelryHero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/[0.07] bg-[#090a0d]">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1800&q=85"
          alt=""
          fill
          priority
          unoptimized
          className="object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090d] via-[#08090d]/85 to-[#08090d]/35" />
      </div>
      <div className="market-container grid min-h-[520px] items-center gap-12 py-16 lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-amber-200/[0.08] px-4 py-2 text-[9px] tracking-[0.22em] text-amber-100">
            <Sparkles size={13} /> APEXIVEAI FINE JEWELRY
          </span>
          <h1 className="mt-7 max-w-2xl text-5xl font-semibold leading-[1.05] tracking-[-0.05em] text-white sm:text-7xl">
            A little luxury,
            <br />
            <span className="text-amber-200">made to last.</span>
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
            Discover gold, diamonds, and meaningful pieces from jewelry sellers
            across the marketplace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/jewelry/shop"
              className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-4 text-xs font-semibold text-[#17120a] transition hover:bg-white"
            >
              Shop the collection <ArrowRight size={15} />
            </Link>
            <Link
              href="/jewelry/stores"
              className="rounded-full border border-white/20 px-6 py-4 text-xs text-white transition hover:border-amber-200"
            >
              Discover our stores
            </Link>
          </div>
        </div>

        <div className="hidden justify-self-end rounded-3xl border border-white/15 bg-black/35 p-7 backdrop-blur-md sm:block lg:max-w-sm">
          <p className="text-[9px] tracking-[0.2em] text-amber-200">
            THE JEWELRY EDIT
          </p>
          <p className="mt-4 text-2xl font-medium leading-snug text-white">
            Considered pieces.
            <br />
            Trusted sellers.
          </p>
          <p className="mt-4 text-xs leading-6 text-slate-300">
            Explore product details, material specifications, and seller
            information before you choose.
          </p>
          <div className="mt-6 border-t border-white/10 pt-5 text-[10px] tracking-[0.14em] text-slate-400">
            GOLD · DIAMOND · GEMSTONE
          </div>
        </div>
      </div>
    </section>
  );
}
