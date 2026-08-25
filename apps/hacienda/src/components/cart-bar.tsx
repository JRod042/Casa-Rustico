import { useState } from "react";
import { useCart, cartCount, cartTotal } from "@/store/cart";
import { money } from "@/lib/format";
import { CartSheet } from "@/components/cart-sheet";
import { storeById } from "@/lib/catalog";

export function CartBar() {
  const items = useCart((s) => s.items);
  const storeId = useCart((s) => s.storeId);
  const [open, setOpen] = useState(false);
  const n = cartCount(items);
  if (!n) return null;
  const store = storeById(storeId);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="pressable fixed z-30 flex h-12 items-center justify-between gap-3 rounded-full bg-ink px-5 text-cream shadow-[0_8px_24px_color-mix(in_oklab,var(--color-ink)_30%,transparent)]"
        style={{
          left: "max(20px, env(safe-area-inset-left), calc(50vw - 195px))",
          right: "max(20px, env(safe-area-inset-right), calc(50vw - 195px))",
          bottom: "calc(86px + env(safe-area-inset-bottom))",
          maxWidth: 390,
          marginInline: "auto",
        }}
      >
        <span className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-full bg-cream text-[12px] font-semibold tabular-nums text-ink">
            {n}
          </span>
          <span className="text-[15px] font-medium">View order</span>
        </span>
        <span className="text-[13px] text-cream/70">
          {store?.name} · {money(cartTotal(items))}
        </span>
      </button>
      <CartSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
