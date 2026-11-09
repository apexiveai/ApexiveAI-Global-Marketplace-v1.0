import JewelryCatalogPage from "@/components/jewelry/JewelryCatalogPage";

export default function JewelryNewArrivalsPage() {
  return (
    <main className="min-h-screen bg-[#08090d]">
      <JewelryCatalogPage
        collection="new-arrivals"
        title="New arrivals"
        description="The latest approved jewelry listings, sorted by publication date."
      />
    </main>
  );
}
