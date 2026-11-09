import axios from "axios";
import api from "@/lib/api";

export interface JewelryImage {
  id: string;
  image: string;
  alt_text: string;
  display_order: number;
  is_primary: boolean;
}

export interface JewelrySpecification {
  metal_type: string;
  purity: string;
  weight_grams: string;
  gemstone: string;
  gemstone_weight_carat: string | null;
  certificate_number: string;
  certificate_issuer: string;
  has_certificate: boolean;
  craftsmanship_details: string;
}

export interface JewelryVideo {
  id: string;
  url: string;
  duration_seconds: string | null;
  is_primary: boolean;
}

export interface JewelryProduct {
  id: string;
  seller_username: string;
  category_name: string;
  business_type: string;
  sku: string;
  title: string;
  slug: string;
  description: string;
  images: JewelryImage[];
  jewelry_specification: JewelrySpecification | null;
  videos: JewelryVideo[];
  price: string;
  currency: string;
  stock_quantity: number;
  condition: string;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
}

export interface JewelryStore {
  username: string;
  products: JewelryProduct[];
}

export type JewelryCollectionKey =
  | "all"
  | "gold"
  | "diamond"
  | "gemstones"
  | "rings"
  | "necklaces"
  | "bracelets"
  | "earrings"
  | "new-arrivals"
  | "featured";

export const jewelryFallbackImages = {
  gold: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1000&q=85",
  diamond: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1000&q=85",
  gemstone: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1000&q=85",
  ring: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&q=85",
  necklace: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&q=85",
  bracelet: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=1000&q=85",
  earrings: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1000&q=85",
} as const;

export async function getJewelryProducts(): Promise<JewelryProduct[]> {
  const { data } = await api.get<
    JewelryProduct[] | { results: JewelryProduct[] }
  >("catalog/products/");
  const products = Array.isArray(data) ? data : data.results;
  return products.filter((product) => product.business_type === "JEWELRY");
}

export async function getJewelryProduct(
  slug: string,
): Promise<JewelryProduct | null> {
  const products = await getJewelryProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getJewelryStore(username: string): Promise<JewelryStore> {
  const products = await getJewelryProducts();
  const storeProducts = products.filter(
    (product) => product.seller_username.toLowerCase() === username.toLowerCase(),
  );

  if (!storeProducts.length) {
    throw new Error("This jewelry store could not be found.");
  }

  return {
    username: storeProducts[0].seller_username,
    products: storeProducts,
  };
}

export function getJewelryImageUrl(image: string): string {
  if (/^https?:\/\//i.test(image)) return image;

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1";
  const origin = apiBase.replace(/\/api\/v1\/?$/, "");
  return `${origin}${image.startsWith("/") ? image : `/${image}`}`;
}

export function getJewelryVideoUrl(video: string): string {
  return getJewelryImageUrl(video);
}

export function jewelryErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (!error.response) {
      return "Could not reach the marketplace. Check your connection and try again.";
    }
    return `Jewelry could not be loaded (${error.response.status}).`;
  }

  return error instanceof Error
    ? error.message
    : "Jewelry could not be loaded. Please try again.";
}

export function formatJewelryPrice(price: string, currency: string): string {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return `${price} ${currency}`;

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount)} ${currency}`;
}

export function matchesJewelryCollection(
  product: JewelryProduct,
  collection: JewelryCollectionKey,
): boolean {
  const category = product.category_name.toLowerCase();
  const text = `${product.title} ${product.description} ${category}`.toLowerCase();
  const specification = product.jewelry_specification;

  switch (collection) {
    case "all":
      return true;
    case "gold":
      return (
        specification?.metal_type.toLowerCase().includes("gold") === true ||
        category.includes("gold") ||
        text.includes("gold")
      );
    case "diamond":
      return (
        specification?.gemstone.toLowerCase().includes("diamond") === true ||
        category.includes("diamond") ||
        text.includes("diamond")
      );
    case "gemstones":
      return (
        category.includes("gemstone") ||
        category.includes("precious stone") ||
        (Boolean(specification?.gemstone) &&
          !specification?.gemstone.toLowerCase().includes("diamond"))
      );
    case "rings":
    case "necklaces":
    case "bracelets":
    case "earrings":
      return text.includes(collection.slice(0, -1)) || text.includes(collection);
    case "new-arrivals":
      return true;
    case "featured":
      return product.is_featured;
  }
}
