import { cn } from "@/lib/utils";

export function SiteLogo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3.5", compact && "gap-2.5 sm:gap-3", className)}>
      <div
        className={cn(
          "relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[18px] border border-primary/20 bg-[linear-gradient(180deg,rgba(20,25,36,0.96),rgba(8,11,19,0.92))] shadow-[0_14px_30px_rgba(2,6,23,0.34)]",
          compact && "h-10 w-10 rounded-[16px] sm:h-11 sm:w-11",
        )}
      >
        <div className="absolute inset-0 holo-orb opacity-80" />
        <div className={cn("absolute inset-[1px] rounded-[17px] border border-white/10", compact && "rounded-[15px]")} />
        <span
          className={cn(
            "relative font-heading text-lg font-bold tracking-[0.18em] text-white",
            compact && "text-base tracking-[0.14em]",
          )}
        >
          EP
        </span>
      </div>

      <div className={cn("space-y-1", compact && "space-y-0.5")}>
        <div className={cn("font-heading text-lg font-semibold leading-none text-white", compact && "text-base sm:text-lg")}>
          Elite<span className="text-gradient-brand">Pull</span>
        </div>
        {!compact ? (
          <p className="text-[10px] uppercase tracking-[0.34em] text-slate-500">
            TCG Collector Vault
          </p>
        ) : null}
      </div>
    </div>
  );
}
