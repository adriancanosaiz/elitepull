import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { ProductsTable } from "@/components/admin/products-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdminProductsList } from "@/lib/admin/products";

type ProductsPageSearchParams = Promise<{
  q?: string;
  error?: string;
  success?: string;
}>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: ProductsPageSearchParams;
}) {
  const params = await searchParams;
  const searchQuery = params.q?.trim() ?? "";
  const products = await getAdminProductsList(searchQuery);
  const activeCount = products.filter((product) => product.active).length;
  const featuredCount = products.filter((product) => product.featured).length;
  const preorderCount = products.filter((product) => product.isPreorder).length;
  const successMessage = mapListSuccessMessage(params.success);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <div className="rounded-[30px] border border-white/10 bg-black/20 p-6 md:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/75">
            Productos
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-white">
            CRUD V1 de catalogo y stock
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Desde aqui puedes buscar productos, revisar banderas editoriales y hacer ajustes
            rapidos de estado o stock sin tocar todavia workflows mas complejos.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <MetricCard label="Listado" value={String(products.length)} description="Resultados visibles" />
          <MetricCard label="Activos" value={String(activeCount)} description="Publicados o listos" />
          <MetricCard
            label="Campanas"
            value={`${featuredCount} / ${preorderCount}`}
            description="Featured / preventa"
          />
        </div>
      </section>

      {params.error ? <Notice tone="error">{params.error}</Notice> : null}
      {successMessage ? <Notice tone="success">{successMessage}</Notice> : null}

      <section className="rounded-[30px] border border-white/10 bg-black/20 p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Buscar y operar
            </p>
            <h2 className="mt-3 font-heading text-2xl font-semibold text-white">
              Nombre, slug o SKU
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Usa una busqueda ligera por query param `q` para filtrar el listado y mantener el
              flujo de trabajo rapido.
            </p>
          </div>

          <Button asChild size="lg">
            <Link href="/admin/productos/nuevo">
              <Plus className="h-4 w-4" />
              Nuevo producto
            </Link>
          </Button>
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 sm:w-[360px]">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                name="q"
                defaultValue={searchQuery}
                placeholder="Buscar por nombre, slug o SKU"
                className="pl-11"
              />
            </div>
            <Button type="submit" variant="outline">
              Buscar
            </Button>
            {searchQuery ? (
              <Button asChild variant="ghost">
                <Link href="/admin/productos">Limpiar</Link>
              </Button>
            ) : null}
          </form>

          <p className="text-sm text-slate-400">
            {products.length} {products.length === 1 ? "producto" : "productos"} visibles
          </p>
        </div>
      </section>

      <ProductsTable products={products} searchQuery={searchQuery} />
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 font-heading text-2xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-300">{description}</p>
    </div>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: string;
}) {
  return (
    <div
      className={[
        "rounded-[24px] border px-4 py-3 text-sm leading-6",
        tone === "error"
          ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
          : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function mapListSuccessMessage(code?: string) {
  switch (code) {
    case "created":
      return "Producto creado correctamente.";
    case "updated":
      return "Producto actualizado correctamente.";
    case "deleted":
      return "Producto eliminado correctamente.";
    case "status-updated":
      return "Estado del producto actualizado.";
    case "stock-updated":
      return "Stock actualizado correctamente.";
    default:
      return undefined;
  }
}
