import { PackageSearch } from "lucide-react";

import { EmptyState } from "@/components/store/empty-state";

export function ProductNotFoundState() {
  return (
    <section className="app-container pb-8 pt-8 md:pt-10">
      <EmptyState
        className="min-h-[520px]"
        icon={PackageSearch}
        title="No hemos encontrado este producto"
        description="Puede que ya no esté disponible o que el enlace haya cambiado. Te llevamos al catálogo para que sigas explorando."
        action={{ label: "Volver al catalogo", href: "/catalogo" }}
        secondaryAction={{ label: "Ir a inicio", href: "/" }}
      />
    </section>
  );
}
