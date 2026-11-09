import { Suspense } from "react";
import CompareClient from "./compare-client";

export default function AutomotiveComparePage() {
  return (
    <Suspense
      fallback={
        <main className="market-container min-h-[70vh] py-16">
          <div className="h-80 animate-pulse rounded-2xl bg-white/[0.04]" />
        </main>
      }
    >
      <CompareClient />
    </Suspense>
  );
}
