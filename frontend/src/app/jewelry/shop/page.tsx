import JewelryCatalogPage from "@/components/jewelry/JewelryCatalogPage";

export default function JewelryShopPage() {
  return (
    <main className="min-h-screen bg-[#08090d]">
      <JewelryCatalogPage
        collection="all"
        title="Shop all jewelry"
        description="Explore approved jewelry listings from marketplace sellers."
      />
    </main>
  );
}
