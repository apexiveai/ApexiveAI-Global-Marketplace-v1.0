import Link from "next/link";
import { ArrowRight, Check, Gem, Sparkles } from "lucide-react";

const steps = [
  "Choose a jewelry store from the marketplace.",
  "Share the design, material, and size you have in mind.",
  "Confirm pricing and timing directly with the seller.",
];

export default function JewelryCustomOrder() {
  return (
    <main className="market-container min-h-[70vh] py-12 sm:py-16">
      <section className="relative overflow-hidden rounded-3xl border border-amber-200/15 bg-gradient-to-br from-[#221b12] via-[#13130f] to-[#10141b] p-7 sm:p-12">
        <div className="absolute -right-10 -top-10 text-amber-100/[0.07]">
          <Gem size={260} strokeWidth={0.6} />
        </div>
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 text-[9px] tracking-[0.2em] text-amber-200">
            <Sparkles size={13} /> MADE PERSONAL
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-white sm:text-6xl">
            Your idea,
            <br />
            your keepsake.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300">
            Looking for a personal design? Connect with a jewelry seller to
            discuss the materials, sizing, craftsmanship, and timing for a
            custom piece.
          </p>
          <Link
            href="/jewelry/stores"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-4 text-xs font-semibold text-[#17120a] hover:bg-white"
          >
            Find a jewelry store <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <section className="grid gap-10 py-12 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-[9px] tracking-[0.18em] text-amber-200">
            HOW IT WORKS
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Start with a conversation
          </h2>
          <p className="mt-3 text-xs leading-6 text-slate-400">
            Custom requests are arranged directly with each seller. Confirm
            specifications and terms before placing an order.
          </p>
        </div>
        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li
              key={step}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-[#10141b] p-5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-200/25 text-amber-100">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-white">{step}</p>
                <p className="mt-2 flex items-center gap-1 text-[10px] text-slate-500">
                  <Check size={12} /> Discuss details before confirming
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
