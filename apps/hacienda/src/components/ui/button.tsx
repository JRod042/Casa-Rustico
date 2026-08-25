import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "forest";
  size?: "md" | "lg" | "sm";
  staticPress?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  staticPress,
  ...props
}: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight",
        "transition-[transform,background-color,opacity] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "disabled:opacity-40 disabled:pointer-events-none",
        !staticPress && "active:not-disabled:scale-[0.96]",
        size === "lg" && "h-12 px-6 text-[17px]",
        size === "md" && "h-11 px-5 text-[15px]",
        size === "sm" && "h-9 px-4 text-[13px]",
        variant === "primary" && "bg-clay text-cream",
        variant === "forest" && "bg-forest text-cream",
        variant === "secondary" && "bg-ink/8 text-ink",
        variant === "ghost" && "bg-transparent text-clay",
        className,
      )}
      {...props}
    />
  );
}
