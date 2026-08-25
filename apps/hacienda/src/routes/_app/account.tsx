import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserButton, RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { LargeTitle } from "@/components/app-shell";
import { GroupedList, GroupRow } from "@/components/grouped-list";
import { RewardsCard } from "@/components/rewards-card";
import { getProfile, listFavorites, listLedger, listOrders, listSaved, updateProfile } from "@/lib/api";
import { formatMember, productById, REWARDS, TIERS, storeById } from "@/lib/catalog";
import { money, relativeTime } from "@/lib/format";
import { useState } from "react";

export const Route = createFileRoute("/_app/account")({ component: Account });

function Account() {
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const profileQ = useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
    enabled: Boolean(user),
  });
  const ledgerQ = useQuery({
    queryKey: ["ledger"],
    queryFn: () => listLedger(),
    enabled: Boolean(user),
  });
  const ordersQ = useQuery({
    queryKey: ["orders"],
    queryFn: () => listOrders(),
    enabled: Boolean(user),
  });
  const favQ = useQuery({
    queryKey: ["favorites"],
    queryFn: () => listFavorites(),
    enabled: Boolean(user),
  });
  const savedQ = useQuery({
    queryKey: ["saved"],
    queryFn: () => listSaved(),
    enabled: Boolean(user),
  });
  const [month, setMonth] = useState<string>("");
  const [day, setDay] = useState<string>("");

  if (isPending) return <div className="mx-5 mt-8 h-48 animate-pulse rounded-xl bg-ink/10" />;
  if (!user) return <RedirectToSignIn />;
  const p = profileQ.data;
  const nextTier = TIERS.find((t) => p && p.lifetimeBeans < t.minLifetime);

  return (
    <>
      <LargeTitle kicker="Member" title={user.displayName?.split(" ")[0] ?? "Account"} />
      {p ? <RewardsCard profile={p} /> : null}

      <div className="mt-5 px-5">
        <p className="text-[13px] text-muted">
          {p ? formatMember(p.memberNo) : ""} · {p?.tierName} · {p?.lifetimeBeans} lifetime beans
        </p>
        {nextTier ? (
          <p className="mt-1 text-[13px] text-muted">
            {nextTier.minLifetime - (p?.lifetimeBeans ?? 0)} beans to {nextTier.name}
          </p>
        ) : (
          <p className="mt-1 text-[13px] text-muted">Hacienda tier — 2× beans always.</p>
        )}
      </div>

      <GroupedList header="Rewards" className="mt-6">
        {REWARDS.map((r) => (
          <GroupRow
            key={r.id}
            label={`${r.beans} · ${r.name}`}
            value={p && p.beans >= r.beans ? "Ready" : ""}
          />
        ))}
      </GroupedList>

      <GroupedList header="Casa Card" className="mt-5">
        <GroupRow label="Balance" value={p ? money(p.walletCents) : "—"} />
        <GroupRow
          label="Favorite store"
          value={p?.favoriteStoreId ? storeById(p.favoriteStoreId)?.city : "None"}
        />
      </GroupedList>

      <section className="mt-5 px-5">
        <p className="mb-1.5 px-1 text-[13px] font-medium uppercase tracking-[0.08em] text-muted">
          Birthday treat
        </p>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const m = Number(month);
            const d = Number(day);
            if (!m || !d) return;
            void updateProfile({ data: { birthdayMonth: m, birthdayDay: d } }).then(() => {
              void qc.invalidateQueries({ queryKey: ["profile"] });
            });
          }}
        >
          <input
            inputMode="numeric"
            placeholder="Month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="h-11 w-20 rounded-md bg-card px-3 text-[16px] outline-none ring-1 ring-line"
          />
          <input
            inputMode="numeric"
            placeholder="Day"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="h-11 w-20 rounded-md bg-card px-3 text-[16px] outline-none ring-1 ring-line"
          />
          <button type="submit" className="h-11 rounded-full bg-ink px-4 text-[14px] text-cream">
            Save
          </button>
        </form>
        {p?.birthdayMonth && p.birthdayDay ? (
          <p className="mt-2 text-[13px] text-muted">
            {p.birthdayMonth}/{p.birthdayDay} — a handcrafted drink on us.
          </p>
        ) : null}
      </section>

      {favQ.data && favQ.data.length > 0 ? (
        <section className="mt-6">
          <p className="mb-2 px-5 text-[13px] font-medium uppercase tracking-[0.08em] text-muted">
            Favorites
          </p>
          <div className="flex gap-3 overflow-x-auto px-5 snap-x">
            {favQ.data.map((id) => {
              const prod = productById(id);
              if (!prod) return null;
              return (
                <Link
                  key={id}
                  to="/order/$id"
                  params={{ id }}
                  className="snap-item w-28 shrink-0"
                >
                  <img src={prod.image} alt="" className="h-28 w-28 rounded-md object-cover" />
                  <p className="mt-1 line-clamp-2 text-[12px]">{prod.name}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {savedQ.data && savedQ.data.length > 0 ? (
        <GroupedList header="Saved drinks" className="mt-5">
          {savedQ.data.map((s) => (
            <GroupRow key={s.id} label={s.name} value={productById(s.productId)?.name} />
          ))}
        </GroupedList>
      ) : null}

      {ordersQ.data && ordersQ.data.length > 0 ? (
        <GroupedList header="Recent orders" className="mt-5">
          {ordersQ.data.slice(0, 8).map((o) => (
            <GroupRow
              key={o.id}
              label={`${storeById(o.storeId)?.city ?? "Pickup"} · ${o.status}`}
              value={`${money(o.totalCents)} · ${relativeTime(o.createdAt)}`}
            />
          ))}
        </GroupedList>
      ) : null}

      {ledgerQ.data && ledgerQ.data.length > 0 ? (
        <GroupedList header="Bean history" className="mt-5">
          {ledgerQ.data.slice(0, 12).map((row) => (
            <GroupRow
              key={row.id}
              label={row.reason}
              value={`${row.delta > 0 ? "+" : ""}${row.delta}`}
            />
          ))}
        </GroupedList>
      ) : null}

      <GroupedList header="Perks" className="mt-5">
        {TIERS.map((t) => (
          <div key={t.id} className="border-b border-line px-4 py-3 last:border-0">
            <p className="text-[17px]">
              {t.name}
              {p?.tierId === t.id ? " · current" : ""}
            </p>
            <p className="text-[13px] text-muted">{t.perks.join(" · ")}</p>
          </div>
        ))}
      </GroupedList>

      <div className="mt-6 flex items-center justify-between px-5 pb-8">
        <p className="text-[13px] text-muted">{user.primaryEmail}</p>
        <UserButton />
      </div>
      <p className="px-5 pb-4 text-center text-[12px] text-subtle">
        Partner-roasted and packed in the U.S. under our label.
      </p>
    </>
  );
}
