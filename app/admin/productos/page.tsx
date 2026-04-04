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
      {/* Header */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_320px]">
        <div className="rounded-[30px] border border-white/10 bg-black/20 p-6 md:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/75">
            Productos
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-white">
            Tus productos
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Aquí puedes ver y gestionar todos los productos de la tienda. Edita precios,
            actualiza el stock o cambia la visibilidad de cada producto.
          </p>
          <div className="mt-5">
            <Button asChild size="lg">
              <Link href="/admin/productos/nuevo">
                <Plus className="h-4 w-4" />
                Añadir producto
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
          <QuickStat
            label="Total de productos"
            value={String(products.length)}
            description={searchQuery ? "resultados de la búsqueda" : "en el catálogo"}
          />
          <QuickStat
            label="Visibles en tienda"
            value={String(activeCount)}
            description="los pueden ver los clientes"
          />
          <QuickStat
            label="Destacados / Preventa"
            value={`${featuredCount} / ${preorderCount}`}
            description="en portada / con reserva"
          />
        </div>
      </section>

      {/* Notificaciones */}
      {params.error ? <Notice tone="error">{params.error}</Notice> : null}
      {successMessage ? <Notice tone="success">{successMessage}</Notice> : null}

      {/* Buscador */}
      <section className="rounded-[30px] border border-white/10 bg-black/20 p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
              Buscar
            </p>
            <h2 className="mt-2 font-heading text-xl font-semibold text-white">
              Busca por nombre del producto
            </h2>
          </div>

          <p className="text-sm text-slate-400">
            {products.length} {products.length === 1 ? "producto" : "productos"}
            {searchQuery ? ` encontrados para "${searchQuery}"` : " en total"}
          </p>
        </div>

        <form className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 sm:w-[380px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              name="q"
              defaultValue={searchQuery}
              placeholder="Escribe el nombre del producto…"
              className="pl-11"
            />
          </div>
          <Button type="submit" variant="outline">
            Buscar
          </Button>
          {searchQuery ? (
            <Button asChild variant="ghost">
              <Link href="/admin/productos">Ver todos</Link>
            </Button>
          ) : null}
        </form>
      </section>

      <ProductsTable products={products} searchQuery={searchQuery} />
    </div>
  );
}

function QuickStat({
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
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
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
        "rounded-[24px] border px-5 py-4 text-sm leading-6",
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
      return "¡Producto creado correctamente! Ya está en el catálogo.";
    case "created-with-media":
      return "¡Producto creado correctamente! También se han subido la portada y la galería inicial.";
    case "updated":
      return "Producto actualizado correctamente.";
    case "deleted":
      return "Producto eliminado correctamente.";
    case "status-updated":
      return "La visibilidad del producto se ha actualizado.";
    case "stock-updated":
      return "El stock se ha actualizado correctamente.";
    default:
      return undefined;
  }
}
