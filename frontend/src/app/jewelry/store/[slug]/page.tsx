import { Suspense } from "react";
import JewelryStoreRoute from "@/components/jewelry/JewelryStoreRoute";

export default function JewelryStoreDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="market-container min-h-[70vh] py-12">
          <div className="h-56 animate-pulse rounded-3xl bg-white/[0.04]" />
        </main>
      }
    >
      <JewelryStoreRoute />
    </Suspense>
  );
}
