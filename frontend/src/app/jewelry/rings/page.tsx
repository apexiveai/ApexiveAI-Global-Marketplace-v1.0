import JewelryCatalogPage from "@/components/jewelry/JewelryCatalogPage";

export default function RingsPage() {
  return (
    <main className="min-h-screen bg-[#08090d]">
      <JewelryCatalogPage
        collection="rings"
        title="Rings"
        description="Browse rings for milestones, gifting, and everyday wear."
      />
    </main>
  );
}
