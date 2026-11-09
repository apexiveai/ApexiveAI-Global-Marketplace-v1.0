export interface VehicleImage {
  id: string;
  image: string;
  alt_text?: string;
  is_primary: boolean;
}

export const DANZA_SHOWCASE_PHOTOS = [
  {
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1400&q=85",
    alt_text: "Premium coupe displayed in a dark showroom",
  },
  {
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=85",
    alt_text: "Luxury sedan driving on an open road",
  },
  {
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1400&q=85",
    alt_text: "Executive sedan on a city street",
  },
];

export interface VehicleVideo {
  id: string;
  url: string;
  duration_seconds: string | null;
  is_primary: boolean;
}

export interface VehicleSpecification {
  make: string;
  model_name: string;
  model_year: number;
  mileage_km: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  engine_capacity_cc: number | null;
  exterior_color: string;
  number_of_owners: number | null;
  availability: "AVAILABLE" | "RESERVED" | "SOLD";
}

export interface AutomotiveVehicle {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: string;
  currency: string;
  condition: string;
  stock_quantity: number;
  published_at: string | null;
  seller_username: string;
  seller_name: string;
  partner_slug: string | null;
  specification: VehicleSpecification;
  images: VehicleImage[];
  videos: VehicleVideo[];
}

export interface VehicleFilters {
  q?: string;
  make?: string;
  model?: string;
  fuel_type?: string;
  body_type?: string;
  year_from?: string;
  year_to?: string;
  min_price?: string;
  max_price?: string;
  ids?: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8000/api/v1";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error("Could not reach the marketplace API. Check the backend connection and try again.");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`The marketplace API returned an unreadable response (${response.status}).`);
  }

  if (!response.ok) {
    const detail =
      typeof payload === "object" &&
      payload !== null &&
      "detail" in payload &&
      typeof payload.detail === "string"
        ? payload.detail
        : `The marketplace API request failed (${response.status}).`;
    throw new Error(detail);
  }
  return payload as T;
}

export async function getVehicles(
  filters: VehicleFilters = {},
): Promise<AutomotiveVehicle[]> {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const suffix = query.size ? `?${query.toString()}` : "";
  const payload = await request<
    AutomotiveVehicle[] | { results: AutomotiveVehicle[] }
  >(`/automotive/vehicles/${suffix}`);
  return Array.isArray(payload) ? payload : payload.results;
}

export function getVehicle(vehicleId: string): Promise<AutomotiveVehicle> {
  return request(`/automotive/vehicles/${encodeURIComponent(vehicleId)}/`);
}

export function submitVehicleInquiry(
  vehicleId: string,
  values: {
    name: string;
    email: string;
    phone: string;
    message: string;
  },
) {
  return request(`/automotive/vehicles/${encodeURIComponent(vehicleId)}/inquiries/`, {
    method: "POST",
    body: JSON.stringify({ ...values, product: vehicleId }),
  });
}

export function submitTestDriveRequest(
  vehicleId: string,
  values: {
    name: string;
    email: string;
    phone: string;
    preferred_at: string;
    message: string;
  },
) {
  return request(`/automotive/vehicles/${encodeURIComponent(vehicleId)}/test-drives/`, {
    method: "POST",
    body: JSON.stringify({ ...values, product: vehicleId }),
  });
}

export function formatVehiclePrice(price: string, currency: string) {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return `${price} ${currency}`;
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(amount)} ${currency}`;
}

export function vehicleImageUrl(image: string) {
  if (/^https?:\/\//i.test(image)) return image;
  return `${API_BASE_URL.replace(/\/api\/v1\/?$/, "")}${image.startsWith("/") ? image : `/${image}`}`;
}
