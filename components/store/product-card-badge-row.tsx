import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ProductCardBadgeItem = {
  label: string;
  variant?: "default" | "secondary" | "outline";
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
    <div className="flex h-11 items-start gap-2 overflow-hidden">
      {visibleItems.map((item) => (
        <Badge
          key={`${item.label}-${item.variant ?? "default"}`}
          variant={item.variant}
          className={cn("max-w-[9.5rem] shrink-0 truncate", item.className)}
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
