import { Suspense } from "react";
import JewelryProductPage from "@/components/jewelry/JewelryProductPage";

export default function JewelryProductDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="market-container min-h-[70vh] py-10">
          <div className="h-[480px] animate-pulse rounded-3xl bg-white/[0.04]" />
        </main>
      }
    >
      <JewelryProductPage />
    </Suspense>
  );
}
