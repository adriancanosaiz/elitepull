import { PackageSearch } from "lucide-react";

import { EmptyState } from "@/components/store/empty-state";

export function ProductNotFoundState() {
  return (
    <section className="app-container pb-8 pt-8 md:pt-10">
      <EmptyState
        className="min-h-[520px]"
        icon={PackageSearch}
        title="No hemos encontrado este producto"
        description="Puede que ya no este disponible, que el slug haya cambiado o que aun no se haya conectado el backend real."
        action={{ label: "Volver al catalogo", href: "/catalogo" }}
        secondaryAction={{ label: "Ir a inicio", href: "/" }}
      />
    </section>
  );
}
