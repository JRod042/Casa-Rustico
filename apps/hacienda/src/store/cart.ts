import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Customization } from "@/lib/api";
import { productById } from "@/lib/catalog";

export type CartItem = {
  key: string;
  productId: string;
  qty: number;
  custom: Customization;
};

type CartState = {
  storeId: string;
  items: CartItem[];
  setStore: (id: string) => void;
  add: (productId: string, custom: Customization, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

function keyOf(productId: string, custom: Customization) {
  return `${productId}:${JSON.stringify(custom)}`;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      storeId: "sanjuan",
      items: [],
      setStore: (id) => set({ storeId: id }),
      add: (productId, custom, qty = 1) => {
        const key = keyOf(productId, custom);
        const items = [...get().items];
        const i = items.findIndex((it) => it.key === key);
        if (i >= 0) items[i] = { ...items[i], qty: items[i].qty + qty };
        else items.push({ key, productId, qty, custom });
        set({ items });
      },
      setQty: (key, qty) => {
        if (qty <= 0) set({ items: get().items.filter((it) => it.key !== key) });
        else
          set({
            items: get().items.map((it) => (it.key === key ? { ...it, qty } : it)),
          });
      },
      remove: (key) => set({ items: get().items.filter((it) => it.key !== key) }),
      clear: () => set({ items: [] }),
    }),
    { name: "casa-cart" },
  ),
);

export function cartCount(items: CartItem[]) {
  return items.reduce((s, i) => s + i.qty, 0);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, it) => {
    const p = productById(it.productId);
    if (!p) return sum;
    let unit = p.priceCents;
    if (p.kind === "drink" && it.custom.size) {
      const d = { "8": 0, "12": 50, "16": 80, "20": 110 }[it.custom.size] ?? 0;
      unit += d;
    }
    if (it.custom.shots && it.custom.shots > 2) unit += (it.custom.shots - 2) * 80;
    if (it.custom.milk && it.custom.milk !== "Whole" && it.custom.milk !== "2%") unit += 70;
    if (it.custom.syrup && it.custom.syrup !== "None") unit += 60;
    return sum + unit * it.qty;
  }, 0);
}
