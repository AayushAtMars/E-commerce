import { create } from 'zustand';

interface UIState {
  cartItemCount: number;
  setCartItemCount: (count: number) => void;
  incrementCart: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  cartItemCount: 0,
  setCartItemCount: (count) => set({ cartItemCount: count }),
  incrementCart: () => set((state) => ({ cartItemCount: state.cartItemCount + 1 })),
}));
