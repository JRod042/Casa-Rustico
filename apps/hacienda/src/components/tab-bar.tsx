import { Link, useRouterState } from "@tanstack/react-router";
import { Gift, House, MapPin, QrCode, Coffee } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS = [
  { to: "/", label: "Home", icon: House },
  { to: "/order", label: "Order", icon: Coffee },
  { to: "/scan", label: "Scan", icon: QrCode },
  { to: "/gift", label: "Gift", icon: Gift },
  { to: "/stores", label: "Stores", icon: MapPin },
] as const;

export function TabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label="Primary"
      className="glass-tab pointer-events-auto fixed z-40 grid grid-cols-5 px-1.5 py-1.5"
      style={{
        left: "max(16px, env(safe-area-inset-left), calc(50vw - 199px))",
        right: "max(16px, env(safe-area-inset-right), calc(50vw - 199px))",
        bottom: "max(16px, env(safe-area-inset-bottom))",
        borderRadius: 32,
        maxWidth: 398,
        marginInline: "auto",
      }}
    >
      {TABS.map((tab) => {
        const active =
          tab.to === "/"
            ? pathname === "/"
            : pathname === tab.to || pathname.startsWith(tab.to + "/");
        const Icon = tab.icon;
        return (
          <Link
            key={tab.to}
            to={tab.to}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-[24px] px-1 py-1",
              "transition-colors duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
              active ? "text-clay" : "text-muted",
            )}
          >
            <span
              className={cn(
                "grid size-7 place-items-center rounded-full transition-[background-color,transform] duration-200",
                active && "bg-clay/12",
              )}
            >
              <Icon
                className="size-[22px]"
                strokeWidth={active ? 2.2 : 1.7}
                fill={active ? "currentColor" : "none"}
                fillOpacity={active ? 0.18 : 0}
              />
            </span>
            <span className="text-[10px] font-medium leading-none tracking-tight">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
