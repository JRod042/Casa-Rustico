import type { ReactNode } from "react";
import { TabBar } from "@/components/tab-bar";
import { cn } from "@/lib/cn";

export function AppShell({
  children,
  fade = true,
}: {
  children: ReactNode;
  fade?: boolean;
}) {
  return (
    <div className="min-h-dvh bg-grove">
      <div className="relative mx-auto min-h-dvh w-full max-w-[430px] bg-paper text-ink md:shadow-[0_0_80px_color-mix(in_oklab,var(--color-ink)_45%,transparent)]">
        <div
          className={cn("min-h-dvh", fade && "scroll-fade")}
          style={{
            paddingTop: "env(safe-area-inset-top)",
            paddingBottom: "calc(96px + env(safe-area-inset-bottom))",
          }}
        >
          {children}
        </div>
        <TabBar />
      </div>
    </div>
  );
}

export function LargeTitle({
  kicker,
  title,
  trailing,
}: {
  kicker?: string;
  title: string;
  trailing?: ReactNode;
}) {
  return (
    <header className="flex items-end justify-between gap-3 px-5 pb-3 pt-4">
      <div className="min-w-0">
        {kicker ? (
          <p className="mb-0.5 text-[13px] font-medium text-muted">{kicker}</p>
        ) : null}
        <h1 className="font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink">
          {title}
        </h1>
      </div>
      {trailing}
    </header>
  );
}
