import JewelryCatalogPage from "@/components/jewelry/JewelryCatalogPage";

export default function EarringsPage() {
  return (
    <main className="min-h-screen bg-[#08090d]">
      <JewelryCatalogPage
        collection="earrings"
        title="Earrings"
        description="Discover earrings across gold, diamond, and gemstone collections."
      />
    </main>
  );
}
