import JewelryCatalogPage from "@/components/jewelry/JewelryCatalogPage";

export default function NecklacesPage() {
  return (
    <main className="min-h-screen bg-[#08090d]">
      <JewelryCatalogPage
        collection="necklaces"
        title="Necklaces"
        description="Explore necklaces and chains, with product details from each seller."
      />
    </main>
  );
}
