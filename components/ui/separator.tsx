import { cn } from "@/lib/utils";

export function Separator({
  className,
  decorative = true,
  orientation = "horizontal",
}: {
  className?: string;
  decorative?: boolean;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <div
      aria-hidden={decorative}
      className={cn(
        "shrink-0 bg-white/[0.08]",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
    />
  );
}
