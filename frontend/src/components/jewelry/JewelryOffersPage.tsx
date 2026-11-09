import Link from "next/link";
import { ArrowRight, Tag } from "lucide-react";

export default function JewelryOffersPage() {
  return (
    <main className="market-container min-h-[70vh] py-12 sm:py-16">
      <section className="rounded-3xl border border-white/10 bg-[#10141b] p-7 text-center sm:p-14">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-amber-200/25 bg-amber-200/[0.08] text-amber-100">
          <Tag size={22} />
        </span>
        <p className="mt-6 text-[9px] tracking-[0.2em] text-amber-200">
          JEWELRY OFFERS
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          Special finds, when they arrive.
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">
          There are no active jewelry discounts at the moment. Browse the
          latest pieces or check back for future seller offers.
        </p>
        <Link
          href="/jewelry/new-arrivals"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3.5 text-xs font-semibold text-[#17120a] hover:bg-white"
        >
          Explore new arrivals <ArrowRight size={14} />
        </Link>
      </section>
    </main>
  );
}
