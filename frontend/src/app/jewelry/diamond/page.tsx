import JewelryCatalogPage from "@/components/jewelry/JewelryCatalogPage";

export default function DiamondJewelryPage() {
  return (
    <main className="min-h-screen bg-[#08090d]">
      <JewelryCatalogPage
        collection="diamond"
        title="Diamond jewelry"
        description="Find pieces featuring diamonds and review the available certificate information."
      />
    </main>
  );
}
