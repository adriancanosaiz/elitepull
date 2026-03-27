import { Badge } from "@/components/ui/badge";

export function ProductStatusBadge({
  kind,
  value,
  stock,
}: {
  kind: "active" | "featured" | "preorder" | "stock";
  value?: boolean;
  stock?: number;
}) {
  if (kind === "stock") {
    if ((stock ?? 0) <= 0) {
      return (
        <Badge className="border-rose-400/30 bg-rose-500/10 text-rose-100">
          Sin stock
        </Badge>
      );
    }

    if ((stock ?? 0) <= 3) {
      return (
        <Badge className="border-amber-300/30 bg-amber-400/10 text-amber-100">
          Stock bajo
        </Badge>
      );
    }

    return (
      <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-100">
        En stock
      </Badge>
    );
  }

  if (kind === "active") {
    return value ? (
      <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-100">
        Activo
      </Badge>
    ) : (
      <Badge variant="secondary" className="border-white/10 bg-white/[0.04] text-slate-300">
        Inactivo
      </Badge>
    );
  }

  if (kind === "featured") {
    return value ? (
      <Badge className="border-amber-300/30 bg-amber-400/10 text-amber-100">
        Featured
      </Badge>
    ) : (
      <Badge variant="secondary" className="border-white/10 bg-white/[0.04] text-slate-400">
        No
      </Badge>
    );
  }

  return value ? (
    <Badge className="border-cyan-300/30 bg-cyan-400/10 text-cyan-100">
      Preventa
    </Badge>
  ) : (
    <Badge variant="secondary" className="border-white/10 bg-white/[0.04] text-slate-400">
      No
    </Badge>
  );
}
