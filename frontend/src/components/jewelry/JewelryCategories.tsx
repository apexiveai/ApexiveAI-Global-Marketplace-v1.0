import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Gem, Heart, Sparkles } from "lucide-react";

const categories = [
  {
    name: "Gold jewelry",
    description: "Classic gold pieces",
    href: "/jewelry/gold",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=85",
    icon: Sparkles,
  },
  {
    name: "Diamond",
    description: "A touch of brilliance",
    href: "/jewelry/diamond",
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=900&q=85",
    icon: Gem,
  },
  {
    name: "Gemstones",
    description: "Color with character",
    href: "/jewelry/gemstones",
    image: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=900&q=85",
    icon: Heart,
  },
  {
    name: "Everyday favorites",
    description: "Rings, chains & more",
    href: "/jewelry/rings",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=85",
    icon: ArrowUpRight,
  },
];

export default function JewelryCategories() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-[9px] tracking-[0.2em] text-amber-200">
            FIND YOUR FAVORITE
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            Shop by collection
          </h2>
        </div>
        <Link
          href="/jewelry/shop"
          className="inline-flex items-center gap-2 text-xs text-amber-200 hover:text-white"
        >
          View all <ArrowUpRight size={14} />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map(({ name, description, href, image, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group relative isolate min-h-64 overflow-hidden rounded-2xl border border-white/10 bg-[#111722]"
          >
            <Image
              src={image}
              alt=""
              fill
              unoptimized
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/5" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
              <div>
                <Icon size={18} className="mb-3 text-amber-200" />
                <h3 className="text-base font-semibold text-white">{name}</h3>
                <p className="mt-1 text-[10px] text-slate-300">{description}</p>
              </div>
              <ArrowUpRight
                size={17}
                className="mb-1 text-white transition group-hover:-translate-y-1 group-hover:translate-x-1"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
