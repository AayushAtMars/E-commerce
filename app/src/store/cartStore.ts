import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
  appliedPromo: { code: string; discountAmount: number } | null;
  applyPromo: (code: string, discountAmount: number) => void;
  clearPromo: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.findIndex(
            (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
          );
          if (existing >= 0) {
            const updated = [...state.items];
            updated[existing].quantity = Math.min(50, updated[existing].quantity + item.quantity);
            return { items: updated };
          }
          return { items: [...state.items, item] };
        });
      },

      updateQuantity: (productId, size, color, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.size === size && i.color === color
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      removeItem: (productId, size, color) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.size === size && i.color === color)
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      appliedPromo: null,
      applyPromo: (code, discountAmount) => set({ appliedPromo: { code, discountAmount } }),
      clearPromo: () => set({ appliedPromo: null }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
