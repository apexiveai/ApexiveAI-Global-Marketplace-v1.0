import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CarFront } from "lucide-react";

export default function AutomotiveLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080b11]/95 backdrop-blur-xl">
        <div className="market-container flex min-h-20 items-center justify-between gap-6">
          <Link href="/automotive" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300">
              <CarFront size={22} />
            </span>
            <span>
              <span className="block text-xs font-black tracking-[0.18em] text-white">
                APEXIVEAI
              </span>
              <span className="mt-1 block text-[9px] tracking-[0.18em] text-slate-500">
                AUTOMOTIVE
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-xs text-slate-400 md:flex">
            <Link href="/automotive#showroom" className="hover:text-white">
              Showroom
            </Link>
            <Link href="/automotive#catalog" className="hover:text-white">
              All Vehicles
            </Link>
            <Link href="/automotive#services" className="hover:text-white">
              Services
            </Link>
            <Link href="/automotive#commission" className="hover:text-white">
              Commission
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-xs text-slate-300 hover:text-white sm:block"
            >
              Login
            </Link>
            <Link
              href="/automotive#catalog"
              className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-4 py-3 text-[10px] font-bold text-[#17120a] transition hover:bg-white"
            >
              Browse Cars <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-white/10 bg-[#07090e]">
        <div className="market-container grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="text-sm font-black tracking-[0.18em] text-white">
              APEXIVEAI
            </Link>
            <p className="mt-3 max-w-sm text-xs leading-6 text-slate-500">
              A trusted destination for exceptional vehicles, verified sellers,
              showroom inquiries, and test-drive requests.
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-white">Automotive</h2>
            <div className="mt-4 flex flex-col gap-3 text-xs text-slate-500">
              <Link href="/automotive#catalog" className="hover:text-white">
                Vehicle catalogue
              </Link>
              <Link href="/automotive/compare" className="hover:text-white">
                Compare vehicles
              </Link>
              <Link href="/automotive#commission" className="hover:text-white">
                Commission calculator
              </Link>
            </div>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-white">Partner showroom</h2>
            <p className="mt-4 text-xs leading-6 text-slate-500">
              Danza Car Showroom
              <br />
              Premium Partner Showroom
            </p>
          </div>
        </div>
        <div className="border-t border-white/[0.07]">
          <div className="market-container flex flex-col justify-between gap-4 py-5 text-[10px] text-slate-500 sm:flex-row sm:items-center">
            <p>© 2026 ApexiveAI Global Marketplace. All rights reserved.</p>
            <Image
              src="/copyright-bhone-htet-naing.png"
              alt="Copyright Bhone Htet Naing — all rights reserved"
              width={576}
              height={384}
              className="h-auto w-36"
            />
            <p className="tracking-[0.13em]">DANZA CAR SHOWROOM · YANGON</p>
          </div>
        </div>
      </footer>
    </>
  );
}
