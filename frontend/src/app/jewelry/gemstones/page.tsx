import JewelryCatalogPage from "@/components/jewelry/JewelryCatalogPage";

export default function GemstoneJewelryPage() {
  return (
    <main className="min-h-screen bg-[#08090d]">
      <JewelryCatalogPage
        collection="gemstones"
        title="Gemstone jewelry"
        description="Discover colorful stones and handcrafted jewelry from marketplace sellers."
      />
    </main>
  );
}
