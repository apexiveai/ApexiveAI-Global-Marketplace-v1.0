"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, type FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays, CheckCircle2, MessageCircle } from "lucide-react";
import {
  type AutomotiveVehicle,
  DANZA_SHOWCASE_PHOTOS,
  formatVehiclePrice,
  getVehicle,
  submitTestDriveRequest,
  submitVehicleInquiry,
  vehicleImageUrl,
} from "@/lib/automotive";

type ContactMode = "inquiry" | "test-drive";

function AutomotiveVehicleDetailContent() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const [vehicle, setVehicle] = useState<AutomotiveVehicle | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [mode, setMode] = useState<ContactMode>("inquiry");
  const [loadedVehicleId, setLoadedVehicleId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    preferred_at: "",
  });

  useEffect(() => {
    let active = true;
    getVehicle(vehicleId)
      .then((result) => {
        if (active) {
          setVehicle(result);
          setActiveImage(0);
          setError("");
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setVehicle(null);
          setError(
            requestError instanceof Error
              ? requestError.message
              : "This vehicle could not be loaded.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadedVehicleId(vehicleId);
      });
    return () => {
      active = false;
    };
  }, [vehicleId]);

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!vehicle) return;
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      if (mode === "inquiry") {
        await submitVehicleInquiry(vehicle.id, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
        });
        setSuccess("Your inquiry has been sent to the showroom.");
      } else {
        if (!form.preferred_at) {
          setError("Choose a preferred test-drive date and time.");
          return;
        }
        await submitTestDriveRequest(vehicle.id, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          preferred_at: new Date(form.preferred_at).toISOString(),
          message: form.message,
        });
        setSuccess("Your test-drive request has been sent to the showroom.");
      }
      setForm({ name: "", email: "", phone: "", message: "", preferred_at: "" });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Your request could not be submitted.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loadedVehicleId !== vehicleId) {
    return (
      <main className="market-container min-h-[70vh] py-16">
        <div className="h-[480px] animate-pulse rounded-3xl bg-white/[0.04]" />
      </main>
    );
  }

  if (!vehicle) {
    return (
      <main className="market-container min-h-[70vh] py-16">
        <Link href="/automotive" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white">
          <ArrowLeft size={15} /> Back to showroom
        </Link>
        <div className="mt-8 rounded-2xl border border-red-300/20 bg-red-300/[0.05] p-6 text-sm text-red-100">
          {error || "Vehicle not found."}
        </div>
      </main>
    );
  }

  const images = vehicle.images.length
    ? vehicle.images
    : vehicle.partner_slug === "danza"
      ? DANZA_SHOWCASE_PHOTOS.map((photo, index) => ({
          id: `danza-showcase-${index}`,
          image: photo.image,
          alt_text: photo.alt_text,
          is_primary: index === 0,
        }))
      : [];
  const selectedImage = images[activeImage];
  const primaryImage = selectedImage
    ? vehicleImageUrl(selectedImage.image)
    : vehicle.partner_slug === "danza"
      ? DANZA_SHOWCASE_PHOTOS[0].image
      : "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400";
  const spec = vehicle.specification;

  return (
    <main className="market-container min-h-screen py-10 sm:py-14">
      <Link href="/automotive#catalog" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white">
        <ArrowLeft size={15} /> Back to vehicle catalogue
      </Link>

      <div className="mt-7 grid gap-10 lg:grid-cols-[1.15fr_.85fr]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-[#151a22]">
            <Image
              src={primaryImage}
              alt={selectedImage?.alt_text || vehicle.title}
              fill
              priority
              unoptimized
              className="object-cover"
            />
            <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/60 px-3 py-2 text-[9px] tracking-[0.15em] text-white backdrop-blur">
              {spec.availability}
            </span>
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
              {images.map((image, index) => (
                <button
                  type="button"
                  key={image.id}
                  onClick={() => setActiveImage(index)}
                  aria-label={`View photo ${index + 1}`}
                  aria-pressed={activeImage === index}
                  className={`relative aspect-square overflow-hidden rounded-xl border ${
                    activeImage === index ? "border-amber-300" : "border-white/10"
                  }`}
                >
                  <Image src={vehicleImageUrl(image.image)} alt={image.alt_text || `${vehicle.title} photo ${index + 1}`} fill unoptimized className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {vehicle.videos.map((video) => (
            <div key={video.id} className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <video controls preload="metadata" className="aspect-video w-full" src={video.url}>
                Your browser does not support embedded videos.
              </video>
              <p className="px-4 py-3 text-[10px] text-slate-400">
                Approved vehicle video · maximum 180 seconds
              </p>
            </div>
          ))}

          <section className="mt-8 rounded-2xl border border-white/10 bg-[#101621] p-6">
            <p className="text-[9px] tracking-[0.2em] text-amber-200">VEHICLE DESCRIPTION</p>
            <h2 className="mt-3 text-xl font-semibold">{vehicle.title}</h2>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-300">{vehicle.description}</p>
          </section>
        </div>

        <div>
          <div className="rounded-3xl border border-white/10 bg-[#101621] p-6 sm:p-8">
            <p className="text-[9px] tracking-[0.2em] text-amber-200">{spec.make} · {spec.model_year}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">{vehicle.title}</h1>
            <p className="mt-4 text-2xl font-semibold text-amber-200">
              {formatVehiclePrice(vehicle.price, vehicle.currency)}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                ["Make", spec.make],
                ["Model", spec.model_name],
                ["Year", String(spec.model_year)],
                ["Mileage", `${spec.mileage_km.toLocaleString()} km`],
                ["Fuel", spec.fuel_type.replaceAll("_", " ")],
                ["Transmission", spec.transmission],
                ["Engine", spec.engine_capacity_cc ? `${spec.engine_capacity_cc.toLocaleString()} cc` : "Not specified"],
                ["Exterior", spec.exterior_color || "Not specified"],
                ["Condition", vehicle.condition.replaceAll("_", " ")],
                ["Availability", spec.availability],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[0.07] bg-black/10 p-3">
                  <p className="text-[9px] text-slate-500">{label}</p>
                  <p className="mt-1 text-xs text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
              <div>
                <p className="text-xs font-semibold">{vehicle.seller_name}</p>
                <p className="mt-1 text-[10px] text-slate-500">Verified marketplace seller</p>
              </div>
              {vehicle.partner_slug && (
                <span className="inline-flex items-center gap-1 text-[9px] text-emerald-200">
                  <CheckCircle2 size={13} /> Official Partner
                </span>
              )}
            </div>
          </div>

          <section className="mt-5 rounded-3xl border border-white/10 bg-[#101621] p-6">
            <div className="flex gap-2 border-b border-white/10 pb-4">
              <button
                type="button"
                onClick={() => { setMode("inquiry"); setError(""); setSuccess(""); }}
                aria-pressed={mode === "inquiry"}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] ${
                  mode === "inquiry" ? "bg-amber-300 text-[#17120a]" : "border border-white/10 text-slate-300"
                }`}
              >
                <MessageCircle size={13} /> Inquiry
              </button>
              <button
                type="button"
                onClick={() => { setMode("test-drive"); setError(""); setSuccess(""); }}
                aria-pressed={mode === "test-drive"}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] ${
                  mode === "test-drive" ? "bg-amber-300 text-[#17120a]" : "border border-white/10 text-slate-300"
                }`}
              >
                <CalendarDays size={13} /> Test drive
              </button>
            </div>
            <h2 className="mt-5 text-lg font-semibold">
              {mode === "inquiry" ? "Ask the showroom" : "Request a test drive"}
            </h2>
            <p className="mt-2 text-[10px] leading-5 text-slate-400">
              Your contact details will be shared with this vehicle’s seller so they can respond.
            </p>
            <form onSubmit={submitContact} className="mt-5 space-y-3">
              <input
                required
                maxLength={120}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Your name"
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-xs outline-none focus:border-amber-300/60"
              />
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="Email address"
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-xs outline-none focus:border-amber-300/60"
              />
              <input
                required
                type="tel"
                maxLength={30}
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                placeholder="Phone number"
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-xs outline-none focus:border-amber-300/60"
              />
              {mode === "test-drive" && (
                <input
                  required
                  type="datetime-local"
                  value={form.preferred_at}
                  onChange={(event) => setForm({ ...form, preferred_at: event.target.value })}
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#101621] px-4 text-xs text-slate-300 outline-none focus:border-amber-300/60"
                />
              )}
              <textarea
                required={mode === "inquiry"}
                maxLength={2000}
                rows={3}
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                placeholder={mode === "inquiry" ? "What would you like to know?" : "Anything the showroom should know? (optional)"}
                className="w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs outline-none focus:border-amber-300/60"
              />
              {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
              {success && <p role="status" className="text-xs text-emerald-200">{success}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-300 text-xs font-bold text-[#17120a] transition hover:bg-white disabled:opacity-60"
              >
                {submitting ? "Sending..." : mode === "inquiry" ? "Send inquiry" : "Request appointment"}
                {!submitting && <ArrowUpRight size={14} />}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function AutomotiveVehicleDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="market-container min-h-[70vh] py-16">
          <div className="h-[480px] animate-pulse rounded-3xl bg-white/[0.04]" />
        </main>
      }
    >
      <AutomotiveVehicleDetailContent />
    </Suspense>
  );
}
