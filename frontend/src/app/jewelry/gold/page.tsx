import JewelryCatalogPage from "@/components/jewelry/JewelryCatalogPage";

export default function GoldJewelryPage() {
  return (
    <main className="min-h-screen bg-[#08090d]">
      <JewelryCatalogPage
        collection="gold"
        title="Gold jewelry"
        description="Explore gold pieces and review the listed purity and material details."
      />
    </main>
  );
}
