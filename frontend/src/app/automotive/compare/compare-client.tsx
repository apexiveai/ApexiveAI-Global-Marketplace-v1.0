"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, CarFront } from "lucide-react";
import {
  type AutomotiveVehicle,
  formatVehiclePrice,
  getVehicles,
  vehicleImageUrl,
} from "@/lib/automotive";

const rows: { label: string; value: (vehicle: AutomotiveVehicle) => string }[] = [
  { label: "Price", value: (vehicle) => formatVehiclePrice(vehicle.price, vehicle.currency) },
  { label: "Make", value: (vehicle) => vehicle.specification.make },
  { label: "Model", value: (vehicle) => vehicle.specification.model_name },
  { label: "Model year", value: (vehicle) => String(vehicle.specification.model_year) },
  { label: "Mileage", value: (vehicle) => `${vehicle.specification.mileage_km.toLocaleString()} km` },
  { label: "Fuel type", value: (vehicle) => vehicle.specification.fuel_type.replaceAll("_", " ") },
  { label: "Transmission", value: (vehicle) => vehicle.specification.transmission },
  { label: "Body type", value: (vehicle) => vehicle.specification.body_type },
  { label: "Engine capacity", value: (vehicle) => vehicle.specification.engine_capacity_cc ? `${vehicle.specification.engine_capacity_cc.toLocaleString()} cc` : "Not specified" },
  { label: "Exterior color", value: (vehicle) => vehicle.specification.exterior_color || "Not specified" },
  { label: "Condition", value: (vehicle) => vehicle.condition.replaceAll("_", " ") },
  { label: "Availability", value: (vehicle) => vehicle.specification.availability },
];

export default function CompareClient() {
  const searchParams = useSearchParams();
  const idsKey = searchParams.get("ids") ?? "";
  const ids = idsKey.split(",").filter(Boolean).slice(0, 3);
  const [vehicles, setVehicles] = useState<AutomotiveVehicle[]>([]);
  const [loadedIdsKey, setLoadedIdsKey] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const requestedIds = idsKey.split(",").filter(Boolean).slice(0, 3);
    if (requestedIds.length < 2) {
      return () => {
        active = false;
      };
    }

    getVehicles({ ids: requestedIds.join(",") })
      .then((result) => {
        if (active) {
          const byId = new Map(result.map((vehicle) => [vehicle.id, vehicle]));
          setVehicles(requestedIds.flatMap((id) => {
            const vehicle = byId.get(id);
            return vehicle ? [vehicle] : [];
          }));
          setError("");
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(requestError instanceof Error ? requestError.message : "Comparison could not be loaded.");
        }
      })
      .finally(() => {
        if (active) setLoadedIdsKey(idsKey);
      });
    return () => {
      active = false;
    };
  }, [idsKey]);

  const loading = ids.length >= 2 && loadedIdsKey !== idsKey;

  return (
    <main className="market-container min-h-[70vh] py-12 sm:py-16">
      <Link href="/automotive#catalog" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white">
        <ArrowLeft size={15} /> Back to vehicle catalogue
      </Link>
      <div className="mt-8">
        <p className="text-[9px] tracking-[0.2em] text-amber-200">DANZA SHOWROOM</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Compare vehicles</h1>
        <p className="mt-3 text-xs text-slate-400">Compare specifications side by side before contacting the showroom.</p>
      </div>

      {ids.length < 2 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <CarFront className="mx-auto text-slate-500" size={28} />
          <p className="mt-4 text-sm text-slate-300">Select at least two available vehicles to compare.</p>
          <Link href="/automotive#catalog" className="mt-5 inline-flex items-center gap-2 text-xs text-amber-200">
            Browse vehicles <ArrowUpRight size={14} />
          </Link>
        </div>
      ) : loading ? (
        <div className="mt-10 h-80 animate-pulse rounded-2xl bg-white/[0.04]" />
      ) : error ? (
        <div role="alert" className="mt-8 rounded-xl border border-red-300/20 bg-red-300/[0.05] p-5 text-xs text-red-100">{error}</div>
      ) : vehicles.length < 2 ? (
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <CarFront className="mx-auto text-slate-500" size={28} />
          <p className="mt-4 text-sm text-slate-300">Select at least two available vehicles to compare.</p>
          <Link href="/automotive#catalog" className="mt-5 inline-flex items-center gap-2 text-xs text-amber-200">
            Browse vehicles <ArrowUpRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="bg-[#111722]">
                <th className="w-40 p-4 text-[10px] font-medium text-slate-500">VEHICLE</th>
                {vehicles.map((vehicle) => {
                  const image = vehicle.images.find((item) => item.is_primary) ?? vehicle.images[0];
                  return (
                    <th key={vehicle.id} className="min-w-52 p-4 align-top">
                      <Link href={`/automotive/vehicles/${vehicle.id}`} className="group">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-black">
                          {image && (
                            <Image src={vehicleImageUrl(image.image)} alt={image.alt_text || vehicle.title} fill unoptimized className="object-cover transition group-hover:scale-105" />
                          )}
                        </div>
                        <p className="mt-3 text-xs font-semibold text-white group-hover:text-amber-200">{vehicle.title}</p>
                        <p className="mt-1 text-[10px] text-slate-400">{vehicle.seller_name}</p>
                      </Link>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-white/[0.08] even:bg-white/[0.02]">
                  <th className="p-4 text-[10px] font-medium text-slate-400">{row.label}</th>
                  {vehicles.map((vehicle) => (
                    <td key={vehicle.id} className="p-4 text-xs text-white">{row.value(vehicle)}</td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-white/[0.08] bg-[#111722]">
                <th className="p-4" />
                {vehicles.map((vehicle) => (
                  <td key={vehicle.id} className="p-4">
                    <Link href={`/automotive/vehicles/${vehicle.id}`} className="inline-flex items-center gap-2 text-[10px] text-amber-200">
                      View details <ArrowUpRight size={13} />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
