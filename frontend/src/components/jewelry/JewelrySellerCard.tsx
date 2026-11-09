import Link from "next/link";
import { ArrowUpRight, Store } from "lucide-react";
import type { JewelryProduct } from "@/lib/jewelry-api";

export default function JewelrySellerCard({
  product,
}: {
  product: JewelryProduct;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#10141b] p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-200/20 bg-amber-200/[0.08] text-amber-100">
          <Store size={18} />
        </span>
        <div>
          <p className="text-[9px] tracking-[0.15em] text-slate-400">
            SOLD BY
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            {product.seller_username}
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-400">
        View more jewelry from this marketplace seller.
      </p>
      <Link
        href={`/jewelry/store/${encodeURIComponent(product.seller_username)}`}
        className="mt-4 inline-flex items-center gap-2 text-xs text-amber-200 hover:text-white"
      >
        Visit store <ArrowUpRight size={14} />
      </Link>
    </section>
  );
}
