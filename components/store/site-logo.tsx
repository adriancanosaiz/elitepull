import { cn } from "@/lib/utils";

export function SiteLogo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3.5", className)}>
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[18px] border border-primary/20 bg-[linear-gradient(180deg,rgba(20,25,36,0.96),rgba(8,11,19,0.92))] shadow-[0_14px_30px_rgba(2,6,23,0.34)]">
        <div className="absolute inset-0 holo-orb opacity-80" />
        <div className="absolute inset-[1px] rounded-[17px] border border-white/10" />
        <span className="relative font-heading text-lg font-bold tracking-[0.18em] text-white">
          EP
        </span>
      </div>

      <div className="space-y-1">
        <div className="font-heading text-lg font-semibold leading-none text-white">
          Elite<span className="text-gradient-brand">Pull</span>
        </div>
        {!compact ? (
          <p className="text-[10px] uppercase tracking-[0.34em] text-slate-500">
            Collector Vault
          </p>
        ) : null}
      </div>
    </div>
  );
}
