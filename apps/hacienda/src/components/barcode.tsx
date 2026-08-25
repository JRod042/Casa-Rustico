import { useMemo } from "react";

function barsFrom(code: string) {
  const bits: number[] = [];
  for (let i = 0; i < code.length; i++) {
    const n = code.charCodeAt(i);
    for (let b = 0; b < 8; b++) bits.push((n >> b) & 1);
    bits.push(0, 1, 0);
  }
  return bits;
}

export function Barcode({ code, className }: { code: string; className?: string }) {
  const bits = useMemo(() => barsFrom(code + code), [code]);
  return (
    <div className={className} aria-hidden>
      <div className="relative h-16 overflow-hidden rounded-sm bg-cream">
        <div className="barcode-slide absolute inset-x-2 top-0">
          <svg viewBox={`0 0 ${bits.length} 80`} className="h-24 w-full" preserveAspectRatio="none">
            {bits.map((bit, i) =>
              bit ? (
                <rect
                  key={i}
                  x={i}
                  y={0}
                  width={1}
                  height={80}
                  fill="currentColor"
                  className="text-ink"
                />
              ) : null,
            )}
          </svg>
        </div>
      </div>
      <p className="mt-2 text-center font-mono text-[11px] tabular-nums tracking-[0.22em] text-ink/80">
        {code.replace(/(.{4})/g, "$1 ").trim()}
      </p>
    </div>
  );
}
