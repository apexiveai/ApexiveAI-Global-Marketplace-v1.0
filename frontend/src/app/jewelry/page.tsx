import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import JewelryCategories from "@/components/jewelry/JewelryCategories";
import JewelryCatalogPage from "@/components/jewelry/JewelryCatalogPage";
import JewelryHero from "@/components/jewelry/JewelryHero";

export default function JewelryPage() {
  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      <JewelryHero />
      <div className="market-container">
        <JewelryCategories />
      </div>
      <JewelryCatalogPage
        collection="featured"
        title="Featured pieces"
        description="A selection of standout jewelry from marketplace sellers."
        showFilters={false}
        limit={4}
      />
      <section className="market-container grid gap-4 pb-16 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#10141b] p-6">
          <ShieldCheck size={20} className="text-amber-200" />
          <h2 className="mt-4 text-base font-semibold">Shop with clarity</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Review materials, specifications, and seller details on every
            available product listing.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#10141b] p-6">
          <Sparkles size={20} className="text-amber-200" />
          <h2 className="mt-4 text-base font-semibold">Make it personal</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Looking for a custom piece? Find a seller and discuss your idea
            directly.
          </p>
          <Link
            href="/jewelry/custom"
            className="mt-4 inline-flex items-center gap-2 text-xs text-amber-200 hover:text-white"
          >
            Explore custom jewelry <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    </main>
  );
}
