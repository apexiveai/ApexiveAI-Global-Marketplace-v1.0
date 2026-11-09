import Link from "next/link";
import JewelryMegaMenu from "@/components/jewelry/JewelryMegaMenu";

export default function JewelryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <JewelryMegaMenu />
      {children}
      <footer className="border-t border-white/[0.08] bg-[#08090d]">
        <div className="market-container flex flex-col gap-5 py-8 text-[10px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>APEXIVEAI FINE JEWELRY</span>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/jewelry/shop" className="hover:text-white">
              Shop
            </Link>
            <Link href="/jewelry/stores" className="hover:text-white">
              Stores
            </Link>
            <Link href="/jewelry/offers" className="hover:text-white">
              Offers
            </Link>
            <Link href="/" className="hover:text-white">
              Marketplace
            </Link>
          </nav>
          <span>Discover pieces from marketplace sellers.</span>
        </div>
      </footer>
    </>
  );
}
