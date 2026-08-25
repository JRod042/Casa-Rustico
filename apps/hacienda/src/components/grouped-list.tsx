import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function GroupedList({
  header,
  children,
  className,
}: {
  header?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("px-5", className)}>
      {header ? (
        <p className="mb-1.5 px-1 text-[13px] font-medium uppercase tracking-[0.08em] text-muted">
          {header}
        </p>
      ) : null}
      <div className="overflow-hidden rounded-lg bg-card">{children}</div>
    </section>
  );
}

export function GroupRow({
  label,
  value,
  onClick,
  trailing,
  destructive,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
  trailing?: ReactNode;
  destructive?: boolean;
}) {
  const inner = (
    <>
      <span
        className={cn(
          "flex-1 text-[17px] tracking-tight",
          destructive ? "text-clay" : "text-ink",
        )}
      >
        {label}
      </span>
      {value ? <span className="text-[15px] text-muted">{value}</span> : null}
      {trailing}
      {onClick ? <ChevronRight className="size-4 text-subtle" /> : null}
    </>
  );
  const cls =
    "flex min-h-11 w-full items-center gap-3 border-b border-line/80 px-4 py-2.5 text-left last:border-b-0";
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {inner}
      </button>
    );
  }
  return <div className={cls}>{inner}</div>;
}
