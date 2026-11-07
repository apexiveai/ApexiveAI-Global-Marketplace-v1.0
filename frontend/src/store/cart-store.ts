
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  currency: string;
  image?: string;
  quantity: number;
  sellerName?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (product) => product.productId === item.productId
          );

          if (existing) {
            return {
              items: state.items.map((product) =>
                product.productId === item.productId
                  ? { ...product, quantity: product.quantity + quantity }
                  : product
              ),
            };
          }

          return {
            items: [...state.items, { ...item, quantity }],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => item.productId !== productId
          ),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (item) => item.productId !== productId
                )
              : state.items.map((item) =>
                  item.productId === productId
                    ? { ...item, quantity }
                    : item
                ),
        })),

      clearCart: () => set({ items: [] }),

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
    }),
    {
      name: "apexiveai-marketplace-cart",
    }
  )
);
