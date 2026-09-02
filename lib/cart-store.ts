import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // product._id + '-' + size
  productId: string;
  title: string;
  slug: string;
  category: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: (open?: boolean) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (newItem) => {
        const id = `${newItem.productId}-${newItem.size}`;
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((item) => item.id === id);

        if (existingIndex > -1) {
          const updated = [...currentItems];
          updated[existingIndex].quantity += newItem.quantity;
          set({ items: updated, isOpen: true });
        } else {
          set({
            items: [...currentItems, { ...newItem, id }],
            isOpen: true,
          });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: (open) => {
        set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen }));
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'svt-shopping-cart-v1',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
