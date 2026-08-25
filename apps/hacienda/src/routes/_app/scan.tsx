import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Barcode } from "@/components/barcode";
import { LargeTitle } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { getProfile, reloadWallet, scanPay } from "@/lib/api";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { formatMember, STORES } from "@/lib/catalog";
import { money } from "@/lib/format";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/cn";

const RELOADS = [1000, 2500, 5000, 10000];

export const Route = createFileRoute("/_app/scan")({ component: Scan });

function Scan() {
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const storeId = useCart((s) => s.storeId);
  const profileQ = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
    enabled: Boolean(user),
  });
  const [amount, setAmount] = useState(1000);
  const [busy, setBusy] = useState<"reload" | "pay" | null>(null);

  if (isPending) {
    return <div className="mx-5 mt-8 h-80 animate-pulse rounded-xl bg-forest/40" />;
  }
  if (!user) return <RedirectToSignIn />;

  const p = profileQ.data;
  const store = STORES.find((s) => s.id === storeId) ?? STORES[0];

  return (
    <>
      <LargeTitle kicker="Casa Card" title="Scan" />
      <div className="px-5">
        <div className="overflow-hidden rounded-xl bg-forest text-cream shadow-[0_16px_40px_color-mix(in_oklab,var(--color-forest)_40%,transparent)]">
          <div className="px-5 pt-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-cream/60">
              Hacienda Rewards
            </p>
            <p className="mt-1 font-display text-[28px] leading-none">Casa Rústico</p>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-[12px] text-cream/60">Balance</p>
                <p className="font-display text-[32px] tabular-nums leading-none">
                  {p ? money(p.walletCents) : "—"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-cream/60">Beans</p>
                <p className="text-[20px] tabular-nums">{p?.beans ?? 0}</p>
              </div>
            </div>
            <p className="mt-3 text-[12px] tabular-nums tracking-[0.14em] text-cream/55">
              {p ? formatMember(p.memberNo) : ""}
            </p>
          </div>
          <div className="mt-4 bg-cream px-4 py-4 text-ink">
            {p ? <Barcode code={p.memberNo} /> : null}
            <p className="mt-2 text-center text-[12px] text-muted">
              Show this at the register · {store.city}
            </p>
          </div>
        </div>

        <p className="mt-6 text-[13px] font-medium uppercase tracking-[0.08em] text-muted">
          Reload
        </p>
        <div className="mt-2 grid grid-cols-4 gap-2">
          {RELOADS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setAmount(c)}
              className={cn(
                "h-11 rounded-md text-[14px] font-medium tabular-nums",
                amount === c ? "bg-ink text-cream" : "bg-card",
              )}
            >
              {money(c)}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[12px] text-muted">
          $30 reload adds 10 beans. $50 reload adds 25.
        </p>
        <Button
          size="lg"
          variant="forest"
          className="mt-3 w-full"
          disabled={busy !== null}
          onClick={() => {
            setBusy("reload");
            void reloadWallet({ data: { amountCents: amount } })
              .then(() => {
                void qc.invalidateQueries({ queryKey: ["profile"] });
                toast.success(`Reloaded ${money(amount)}`);
              })
              .catch((e) => toast.error(e instanceof Error ? e.message : "Reload failed"))
              .finally(() => setBusy(null));
          }}
        >
          {busy === "reload" ? "Reloading…" : `Reload ${money(amount)}`}
        </Button>

        <div className="mt-6 rounded-lg bg-card p-4">
          <p className="text-[17px] font-medium">Pay in store</p>
          <p className="mt-1 text-[13px] text-muted">
            Simulates a register scan on your Casa Card — 2 beans per dollar.
          </p>
          <Button
            size="lg"
            variant="primary"
            className="mt-3 w-full"
            disabled={busy !== null || !p}
            onClick={() => {
              setBusy("pay");
              void scanPay({ data: { amountCents: 565, storeId: store.id } })
                .then((r) => {
                  void qc.invalidateQueries();
                  toast.success(`Paid ${money(r.amountCents)} · +${r.beansEarned} beans`);
                })
                .catch((e) => toast.error(e instanceof Error ? e.message : "Payment failed"))
                .finally(() => setBusy(null));
            }}
          >
            {busy === "pay" ? "Scanning…" : "Scan · $5.65 Hacienda drip"}
          </Button>
        </div>
        <p className="mt-4 pb-6 text-center text-[13px] text-muted">
          Need pickup instead? <Link to="/order" className="text-clay">Start an order</Link>
        </p>
      </div>
    </>
  );
}
