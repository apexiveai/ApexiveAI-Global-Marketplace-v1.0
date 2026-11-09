import JewelryCatalogPage from "@/components/jewelry/JewelryCatalogPage";

export default function BraceletsPage() {
  return (
    <main className="min-h-screen bg-[#08090d]">
      <JewelryCatalogPage
        collection="bracelets"
        title="Bracelets"
        description="Find bracelets and explore the materials and craftsmanship listed by sellers."
      />
    </main>
  );
}
