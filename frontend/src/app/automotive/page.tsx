"use client";

import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CarFront,
  Check,
  Gauge,
  MapPin,
  Search,
  SlidersHorizontal,
  Video,
} from "lucide-react";
import {
  AutomotiveVehicle,
  DANZA_SHOWCASE_PHOTOS,
  VehicleFilters,
  formatVehiclePrice,
  getVehicles,
  vehicleImageUrl,
} from "@/lib/automotive";

const categories = [
  { label: "All Vehicles", bodyType: "", fuelType: "", icon: CarFront },
  { label: "Luxury Cars", bodyType: "SEDAN", fuelType: "", icon: BadgeCheck },
  { label: "SUVs & 4WD", bodyType: "SUV", fuelType: "", icon: Gauge },
  { label: "Electric Vehicles", bodyType: "", fuelType: "ELECTRIC", icon: ArrowUpRight },
  { label: "Commercial Vehicles", bodyType: "TRUCK", fuelType: "", icon: MapPin },
];

const emptyFilters: VehicleFilters = {};

function VehicleCard({
  vehicle,
  selected,
  onCompare,
}: {
  vehicle: AutomotiveVehicle;
  selected: boolean;
  onCompare: (id: string) => void;
}) {
  const primaryImage =
    vehicle.images.find((image) => image.is_primary) ?? vehicle.images[0];
  const image = primaryImage
    ? vehicleImageUrl(primaryImage.image)
    : vehicle.partner_slug === "danza"
      ? DANZA_SHOWCASE_PHOTOS[0].image
      : "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200";
  const imageAlt =
    primaryImage?.alt_text ||
    (vehicle.partner_slug === "danza"
      ? DANZA_SHOWCASE_PHOTOS[0].alt_text
      : vehicle.title);

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#101621] transition hover:border-amber-300/40">
      <Link
        href={`/automotive/vehicles/${vehicle.id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-[#171d27]"
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          unoptimized
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[9px] tracking-[0.15em] text-white backdrop-blur">
          {vehicle.specification.availability}
        </span>
        {vehicle.videos.length > 0 && (
          <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-3 py-1.5 text-[9px] text-white">
            <Video size={12} /> Video tour
          </span>
        )}
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[9px] tracking-[0.18em] text-amber-300">
              {vehicle.specification.make} · {vehicle.specification.model_year}
            </p>
            <Link
              href={`/automotive/vehicles/${vehicle.id}`}
              className="mt-2 block text-base font-semibold text-white hover:text-amber-200"
            >
              {vehicle.title}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => onCompare(vehicle.id)}
            aria-pressed={selected}
            className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[10px] transition ${
              selected
                ? "border-amber-300 bg-amber-300 text-[#17120a]"
                : "border-white/15 text-slate-300 hover:border-amber-300/60"
            }`}
          >
            {selected ? <Check size={13} /> : null}
            Compare
          </button>
        </div>
        <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-slate-400">
          {vehicle.description}
        </p>
        <div className="mt-5 grid grid-cols-3 gap-2 border-y border-white/[0.08] py-4 text-[10px] text-slate-400">
          <span>{vehicle.specification.mileage_km.toLocaleString()} km</span>
          <span>{vehicle.specification.fuel_type.replaceAll("_", " ")}</span>
          <span>{vehicle.specification.transmission}</span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-white">
            {formatVehiclePrice(vehicle.price, vehicle.currency)}
          </span>
          <Link
            href={`/automotive/vehicles/${vehicle.id}`}
            aria-label={`View ${vehicle.title}`}
            className="inline-flex items-center gap-2 text-[10px] text-amber-200 hover:text-white"
          >
            View vehicle <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function AutomotivePage() {
  const [vehicles, setVehicles] = useState<AutomotiveVehicle[]>([]);
  const [filters, setFilters] = useState<VehicleFilters>(emptyFilters);
  const [formValues, setFormValues] = useState<VehicleFilters>(emptyFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [compareMessage, setCompareMessage] = useState("");
  const [saleAmount, setSaleAmount] = useState("100000000");

  const loadVehicles = useCallback(async (nextFilters: VehicleFilters) => {
    setLoading(true);
    setError("");
    try {
      setVehicles(await getVehicles(nextFilters));
      setFilters(nextFilters);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Vehicles could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getVehicles(emptyFilters)
      .then((result) => {
        if (active) {
          setVehicles(result);
          setFilters(emptyFilters);
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Vehicles could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void loadVehicles(formValues);
  }

  function chooseCategory(bodyType: string, fuelType: string) {
    const next = { ...filters, body_type: bodyType, fuel_type: fuelType };
    setFormValues((current) => ({ ...current, body_type: bodyType, fuel_type: fuelType }));
    void loadVehicles(next);
    document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  }

  function toggleCompare(id: string) {
    setCompareMessage("");
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((value) => value !== id));
      return;
    }
    if (selectedIds.length >= 3) {
      setCompareMessage("Compare up to three vehicles at a time.");
      return;
    }
    setSelectedIds([...selectedIds, id]);
  }

  const saleValue = Number(saleAmount);
  const commission = Number.isFinite(saleValue) && saleValue > 0 ? saleValue * 0.01 : 0;
  const netAmount = Number.isFinite(saleValue) && saleValue > 0 ? saleValue - commission : 0;
  const money = (amount: number) =>
    `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)} MMK`;

  return (
    <main className="min-h-screen overflow-hidden bg-[#08090d] text-white">
      <section id="showroom" className="relative isolate border-b border-white/[0.07]">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #08090d 4%, rgba(8,9,13,.82) 48%, rgba(8,9,13,.48)), url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=2000')",
          }}
        />
        <div className="market-container grid min-h-[570px] items-center gap-12 py-20 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/[0.08] px-4 py-2 text-[9px] tracking-[0.22em] text-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
              APEXIVEAI AUTOMOTIVE
            </div>
            <h1 className="max-w-3xl text-5xl leading-[1.05] font-semibold tracking-[-0.05em] text-white sm:text-7xl">
              Find the car
              <br />
              <span className="text-amber-200">that moves you.</span>
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Explore verified vehicles, compare the details, and connect
              directly with a trusted showroom in Myanmar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#catalog"
                className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-4 text-xs font-bold text-[#17120a] transition hover:bg-white"
              >
                Explore vehicles <ArrowDown size={15} />
              </Link>
              <Link
                href="#commission"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-4 text-xs text-white hover:border-amber-200"
              >
                Commission calculator <ArrowRight size={15} />
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap gap-8 border-t border-white/15 pt-6">
              <div>
                <p className="text-xl font-semibold">1%</p>
                <p className="mt-1 text-[9px] tracking-[0.15em] text-slate-400">FIXED PARTNER COMMISSION</p>
              </div>
              <div>
                <p className="text-xl font-semibold">180 sec</p>
                <p className="mt-1 text-[9px] tracking-[0.15em] text-slate-400">MAXIMUM VIDEO SHOWCASE</p>
              </div>
              <div>
                <p className="text-xl font-semibold">Verified</p>
                <p className="mt-1 text-[9px] tracking-[0.15em] text-slate-400">SELLER & LISTING REVIEW</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-black/40 p-5 backdrop-blur-xl sm:p-7">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-[9px] tracking-[0.2em] text-amber-200">OFFICIAL PARTNER</p>
                <h2 className="mt-2 text-xl font-semibold">Danza Car Showroom</h2>
                <p className="mt-1 text-xs text-slate-400">Premium Partner Showroom</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/10 text-amber-200">
                <BadgeCheck size={23} />
              </span>
            </div>
            <p className="py-5 text-xs leading-6 text-slate-300">
              Browse luxury cars, SUVs and 4WDs, electric vehicles, and
              commercial vehicles. Each listing includes verified vehicle
              details and direct showroom contact.
            </p>
            <div className="mb-5 grid grid-cols-3 gap-2">
              {DANZA_SHOWCASE_PHOTOS.map((photo) => (
                <div
                  key={photo.image}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-white/5"
                >
                  <Image
                    src={photo.image}
                    alt={photo.alt_text}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 30vw, 130px"
                    className="object-cover transition duration-500 hover:scale-105"
                  />
                </div>
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {categories.slice(1).map(({ label, bodyType, fuelType }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => chooseCategory(bodyType, fuelType)}
                  className="rounded-xl border border-white/10 px-4 py-3 text-left text-xs text-slate-300 transition hover:border-amber-300/50 hover:text-white"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5 text-[10px] text-slate-400">
              <span>Yangon · Myanmar</span>
              <Link href="#catalog" className="inline-flex items-center gap-2 text-amber-200">
                View showroom <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="market-container relative z-10 -mt-7">
        <form
          onSubmit={submitFilters}
          className="grid gap-3 rounded-2xl border border-white/10 bg-[#111722] p-4 shadow-2xl shadow-black/30 md:grid-cols-[1.5fr_repeat(3,1fr)_auto] md:items-end"
        >
          <label className="block">
            <span className="mb-2 block text-[9px] tracking-[0.15em] text-slate-400">BRAND OR MODEL</span>
            <span className="flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3">
              <Search size={15} className="text-amber-200" />
              <input
                value={formValues.q ?? ""}
                onChange={(event) => setFormValues({ ...formValues, q: event.target.value })}
                placeholder="Toyota, BMW, SUV..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-600"
              />
            </span>
          </label>
          <label className="block">
            <span className="mb-2 block text-[9px] tracking-[0.15em] text-slate-400">MODEL YEAR FROM</span>
            <input
              type="number"
              min="1900"
              value={formValues.year_from ?? ""}
              onChange={(event) => setFormValues({ ...formValues, year_from: event.target.value })}
              placeholder="2018"
              className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-xs outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[9px] tracking-[0.15em] text-slate-400">MIN PRICE (MMK)</span>
            <input
              type="number"
              min="0"
              value={formValues.min_price ?? ""}
              onChange={(event) => setFormValues({ ...formValues, min_price: event.target.value })}
              placeholder="Any"
              className="h-11 w-full rounded-lg border border-white/10 bg-black/20 px-3 text-xs outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-[9px] tracking-[0.15em] text-slate-400">FUEL TYPE</span>
            <select
              value={formValues.fuel_type ?? ""}
              onChange={(event) => setFormValues({ ...formValues, fuel_type: event.target.value })}
              className="h-11 w-full rounded-lg border border-white/10 bg-[#111722] px-3 text-xs outline-none"
            >
              <option value="">All fuels</option>
              <option value="PETROL">Petrol</option>
              <option value="DIESEL">Diesel</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ELECTRIC">Electric</option>
              <option value="PHEV">Plug-in hybrid</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-amber-300 px-5 text-xs font-bold text-[#17120a] transition hover:bg-white disabled:opacity-60"
          >
            <SlidersHorizontal size={15} /> Filter
          </button>
        </form>
      </section>

      <section id="catalog" className="market-container scroll-mt-24 py-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-3 text-[9px] tracking-[0.22em] text-amber-200">DANZA SHOWROOM · VEHICLE CATALOGUE</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Find your next vehicle</h2>
            <p className="mt-3 text-xs text-slate-400">
              Search by brand, model, year, fuel type, and price.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormValues(emptyFilters);
              void loadVehicles(emptyFilters);
            }}
            className="text-xs text-slate-400 underline underline-offset-4 hover:text-white"
          >
            Clear filters
          </button>
        </div>

        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map(({ label, bodyType, fuelType, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => chooseCategory(bodyType, fuelType)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-[10px] text-slate-300 transition hover:border-amber-300/50 hover:text-white"
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-xs text-red-100">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void loadVehicles(filters)}
              className="rounded-full border border-red-200/20 px-4 py-2 hover:bg-red-100/10"
            >
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="h-[420px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]" />
            ))}
          </div>
        ) : vehicles.length ? (
          <>
            <div className="mb-4 text-[10px] text-slate-500">
              {vehicles.length} {vehicles.length === 1 ? "VEHICLE" : "VEHICLES"} FOUND
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  selected={selectedIds.includes(vehicle.id)}
                  onCompare={toggleCompare}
                />
              ))}
            </div>
          </>
        ) : !error ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <CarFront className="mx-auto text-slate-500" size={30} />
            <h3 className="mt-4 text-base font-semibold">No vehicles match these filters</h3>
            <p className="mt-2 text-xs text-slate-500">
              Try a different search or check back as new vehicles are approved.
            </p>
          </div>
        ) : null}

        {compareMessage && <p role="status" className="mt-5 text-xs text-amber-200">{compareMessage}</p>}
        {selectedIds.length > 0 && (
          <div className="fixed inset-x-0 bottom-5 z-30 mx-auto flex w-[min(90%,560px)] items-center justify-between gap-4 rounded-2xl border border-amber-300/30 bg-[#111722]/95 p-4 shadow-2xl backdrop-blur">
            <p className="text-xs text-white">{selectedIds.length} vehicle(s) selected</p>
            <Link
              href={`/automotive/compare?ids=${encodeURIComponent(selectedIds.join(","))}`}
              className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-[10px] font-bold text-[#17120a]"
            >
              Compare vehicles <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </section>

      <section id="services" className="border-y border-white/[0.07] bg-[#0c1018] py-20">
        <div className="market-container">
          <div className="max-w-2xl">
            <p className="mb-3 text-[9px] tracking-[0.22em] text-amber-200">SHOWROOM SERVICES</p>
            <h2 className="text-3xl font-semibold">A better way to choose your car</h2>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Vehicle details", "Model year, mileage, fuel, transmission, condition, and availability."],
              ["Photo & video gallery", "Review listing photos and approved video walkarounds up to 180 seconds."],
              ["Compare vehicles", "Compare up to three vehicles side by side before deciding."],
              ["Inquiry & test drive", "Send a message or request an appointment with the showroom."],
            ].map(([title, description]) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-3 text-xs leading-6 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 p-5">
            <div>
              <p className="text-sm font-semibold">Contact Danza Car Showroom</p>
              <p className="mt-1 text-xs text-slate-400">Ask about a vehicle or book a test drive from its detail page.</p>
            </div>
            <Link href="#catalog" className="inline-flex items-center gap-2 text-xs text-amber-200">
              Browse listings <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section id="commission" className="market-container scroll-mt-24 py-20">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div>
            <p className="mb-3 text-[9px] tracking-[0.22em] text-amber-200">APEXIVEAI COMMISSION SYSTEM</p>
            <h2 className="text-3xl font-semibold">Simple. Fixed. Transparent.</h2>
            <p className="mt-4 text-xs leading-7 text-slate-400">
              A fixed 1% partner commission is calculated after an automotive
              sale is verified and recorded by an administrator.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#101621] p-5 sm:p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-semibold">Commission calculator</p>
                <p className="mt-1 text-[10px] text-slate-500">Enter a sale amount in MMK</p>
              </div>
              <span className="rounded-full bg-emerald-300/10 px-3 py-1.5 text-[9px] text-emerald-200">FIXED RATE · 1%</span>
            </div>
            <label className="mt-5 block">
              <span className="mb-2 block text-[10px] text-slate-400">Sale amount (MMK)</span>
              <input
                type="number"
                min="0"
                value={saleAmount}
                onChange={(event) => setSaleAmount(event.target.value)}
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm outline-none focus:border-amber-300/60"
              />
            </label>
            <div className="mt-5 space-y-4 border-t border-white/10 pt-5 text-xs">
              <div className="flex justify-between gap-4 text-slate-400"><span>Sale amount</span><span className="text-white">{money(Math.max(0, saleValue || 0))}</span></div>
              <div className="flex justify-between gap-4 text-slate-400"><span>ApexiveAI commission (1%)</span><span className="font-semibold text-emerald-300">{money(commission)}</span></div>
              <div className="flex justify-between gap-4 text-slate-400"><span>Danza net amount (99%)</span><span className="font-semibold text-white">{money(netAmount)}</span></div>
            </div>
            <p className="mt-5 text-[10px] leading-5 text-slate-500">
              Actual ledger entries, settlement status, and duplicate-sale checks
              are managed through the secured administration API.
            </p>
          </div>
        </div>
      </section>

      {vehicles.some((vehicle) => vehicle.videos.length > 0) && (
        <section className="market-container pb-20">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Video size={15} className="text-amber-200" />
            Approved showroom video tours are available on vehicle detail pages.
          </div>
        </section>
      )}
    </main>
  );
}
