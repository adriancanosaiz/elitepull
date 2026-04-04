import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProductCardBadgeItem = {
  label: string;
  variant?: "default" | "secondary" | "outline" | "destructive";
  className?: string;
};

export function ProductCardBadgeRow({
  items,
  maxVisible = 3,
}: {
  items: ProductCardBadgeItem[];
  maxVisible?: number;
}) {
  const visibleItems = items.slice(0, maxVisible);
  const overflowCount = Math.max(items.length - visibleItems.length, 0);

  return (
    <div className="flex w-full items-start gap-2 overflow-hidden">
      {visibleItems.map((item) => (
        <Badge
          key={`${item.label}-${item.variant ?? "default"}`}
          variant={item.variant}
          className={cn("flex-1 justify-center text-center line-clamp-2 leading-[1.15] text-balance whitespace-normal", item.className)}
          title={item.label}
        >
          {item.label}
        </Badge>
      ))}

      {overflowCount > 0 ? (
        <Badge variant="secondary" className="shrink-0 border-white/10 bg-white/[0.05]">
          +{overflowCount}
        </Badge>
      ) : null}
    </div>
  );
}
