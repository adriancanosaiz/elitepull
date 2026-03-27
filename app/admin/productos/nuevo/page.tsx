import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createAdminProductAction } from "@/app/admin/productos/actions";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { getAdminCategories } from "@/lib/admin/products";

type NewProductSearchParams = Promise<{
  error?: string;
}>;

export default async function AdminNewProductPage({
  searchParams,
}: {
  searchParams: NewProductSearchParams;
}) {
  const params = await searchParams;
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/10 bg-black/20 p-6 md:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/75">
              Nuevo producto
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold text-white">
              Alta rapida de catalogo
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Empieza por la ficha base y deja la media V1 en paths simples. Si lo prefieres,
              puedes crear primero el producto y completar despues las rutas de portada y galeria.
            </p>
          </div>

          <Button asChild variant="outline" size="lg">
            <Link href="/admin/productos">
              <ArrowLeft className="h-4 w-4" />
              Volver al listado
            </Link>
          </Button>
        </div>
      </section>

      <ProductForm
        mode="create"
        action={createAdminProductAction}
        categories={categories}
        error={params.error}
      />
    </div>
  );
}
