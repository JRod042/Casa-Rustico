import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/catalog";
import { money } from "@/lib/format";
import { cn } from "@/lib/cn";

export function ProductTile({
  product,
  layout = "card",
}: {
  product: Product;
  layout?: "card" | "row" | "feature";
}) {
  if (layout === "row") {
    return (
      <Link
        to="/order/$id"
        params={{ id: product.id }}
        className="pressable flex items-center gap-3 px-5 py-3"
      >
        <img
          src={product.image}
          alt=""
          className="size-[64px] rounded-md object-cover"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-medium tracking-tight">{product.name}</p>
          <p className="truncate text-[13px] text-muted">{product.tagline}</p>
        </div>
        <p className="tabular-nums text-[15px] text-muted">{money(product.priceCents)}</p>
      </Link>
    );
  }

  if (layout === "feature") {
    return (
      <Link
        to="/order/$id"
        params={{ id: product.id }}
        className="pressable snap-item relative block min-w-[78%] overflow-hidden rounded-lg"
      >
        <img src={product.image} alt="" className="h-56 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-cream">
          <p className="text-[13px] text-cream/80">{product.tagline}</p>
          <p className="font-display text-[22px] leading-tight">{product.name}</p>
          <p className="mt-1 tabular-nums text-[13px]">{money(product.priceCents)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/order/$id"
      params={{ id: product.id }}
      className={cn("pressable block overflow-hidden rounded-lg bg-card")}
    >
      <img src={product.image} alt="" className="aspect-[3/4] w-full object-cover" />
      <div className="px-3 py-2.5">
        <p className="line-clamp-2 text-[15px] font-medium leading-snug tracking-tight">
          {product.name}
        </p>
        <p className="mt-0.5 tabular-nums text-[13px] text-muted">{money(product.priceCents)}</p>
      </div>
    </Link>
  );
}
