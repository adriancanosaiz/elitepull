"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

import {
  toggleAdminProductActiveAction,
  updateAdminProductStockAction,
} from "@/app/admin/productos/actions";
import { ProductStatusBadge } from "@/components/admin/product-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminProductListItem } from "@/lib/admin/products";

export function ProductsTable({
  products,
  searchQuery,
}: {
  products: AdminProductListItem[];
  searchQuery?: string;
}) {
  const redirectTo = searchQuery?.trim()
    ? `/admin/productos?q=${encodeURIComponent(searchQuery.trim())}`
    : "/admin/productos";

  if (products.length === 0) {
    return (
      <div className="rounded-[30px] border border-dashed border-white/12 bg-black/20 p-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          {searchQuery?.trim() ? "Sin resultados" : "Catalogo vacio"}
        </p>
        <h2 className="mt-4 font-heading text-2xl font-semibold text-white">
          {searchQuery?.trim()
            ? `No hemos encontrado coincidencias para "${searchQuery.trim()}"`
            : "Todavia no hay productos en este listado"}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">
          {searchQuery?.trim()
            ? "Prueba con otro nombre, slug o SKU, o limpia la busqueda para revisar todo el catalogo."
            : "Crea el primer producto desde el admin y usa despues la edicion para completar media, featured, preventa y stock."}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {searchQuery?.trim() ? (
            <Button asChild variant="outline">
              <Link href="/admin/productos">Limpiar busqueda</Link>
            </Button>
          ) : null}
          <Button asChild>
            <Link href="/admin/productos/nuevo">Nuevo producto</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-[30px] border border-white/10 bg-black/20 xl:block">
        <table className="min-w-full divide-y divide-white/10 text-sm">
          <thead className="bg-white/[0.03]">
            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              <th className="px-5 py-4">Nombre</th>
              <th className="px-5 py-4">Marca</th>
              <th className="px-5 py-4">Categoria</th>
              <th className="px-5 py-4">Precio</th>
              <th className="px-5 py-4">Stock</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4">Featured</th>
              <th className="px-5 py-4">Preventa</th>
              <th className="px-5 py-4 text-right">Editar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {products.map((product) => (
              <tr key={product.id} className="align-top">
                <td className="px-5 py-5">
                  <div className="space-y-2">
                    <p className="font-semibold text-white">{product.name}</p>
                    <div className="space-y-1 text-xs text-slate-400">
                      <p>Slug: {product.slug}</p>
                      <p>SKU: {product.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-5 text-slate-200">{brandLabel(product.brandSlug)}</td>
                <td className="px-5 py-5 text-slate-200">{product.categoryLabel}</td>
                <td className="px-5 py-5 text-slate-200">
                  <div className="space-y-1">
                    <p>{formatPrice(product.price)}</p>
                    {product.compareAtPrice ? (
                      <p className="text-xs text-slate-500 line-through">
                        {formatPrice(product.compareAtPrice)}
                      </p>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-5">
                  <div className="space-y-3">
                    <ProductStatusBadge kind="stock" stock={product.stock} />
                    <StockQuickForm
                      productId={product.id}
                      redirectTo={redirectTo}
                      defaultStock={product.stock}
                      compact
                    />
                  </div>
                </td>
                <td className="px-5 py-5">
                  <div className="space-y-3">
                    <ProductStatusBadge kind="active" value={product.active} />
                    <ToggleActiveQuickForm
                      id={product.id}
                      active={product.active}
                      redirectTo={redirectTo}
                    />
                  </div>
                </td>
                <td className="px-5 py-5">
                  <ProductStatusBadge kind="featured" value={product.featured} />
                </td>
                <td className="px-5 py-5">
                  <ProductStatusBadge kind="preorder" value={product.isPreorder} />
                </td>
                <td className="px-5 py-5 text-right">
                  <Button asChild size="sm">
                    <Link href={`/admin/productos/${product.id}`}>Editar</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 xl:hidden">
        {products.map((product) => (
          <article
            key={product.id}
            className="rounded-[28px] border border-white/10 bg-black/20 p-5"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-semibold text-white">{product.name}</p>
                <div className="mt-2 space-y-1 text-xs text-slate-400">
                  <p>Slug: {product.slug}</p>
                  <p>SKU: {product.sku}</p>
                  <p>Marca: {brandLabel(product.brandSlug)}</p>
                  <p>Categoria: {product.categoryLabel}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <ProductStatusBadge kind="active" value={product.active} />
                <ProductStatusBadge kind="featured" value={product.featured} />
                <ProductStatusBadge kind="preorder" value={product.isPreorder} />
                <ProductStatusBadge kind="stock" stock={product.stock} />
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-3">
                <div className="text-sm text-slate-200">
                  Precio: {formatPrice(product.price)}
                  {product.compareAtPrice ? (
                    <span className="ml-2 text-slate-500 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  ) : null}
                </div>
                <StockQuickForm
                  productId={product.id}
                  redirectTo={redirectTo}
                  defaultStock={product.stock}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <ToggleActiveQuickForm
                  id={product.id}
                  active={product.active}
                  redirectTo={redirectTo}
                />
                <Button asChild size="sm">
                  <Link href={`/admin/productos/${product.id}`}>Editar</Link>
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function brandLabel(brandSlug: string) {
  switch (brandSlug) {
    case "pokemon":
      return "Pokemon";
    case "one-piece":
      return "One Piece";
    case "riftbound":
      return "Riftbound";
    case "magic":
      return "Magic";
    case "accesorios":
      return "Accesorios";
    default:
      return brandSlug;
  }
}

function StockQuickForm({
  productId,
  redirectTo,
  defaultStock,
  compact = false,
}: {
  productId: string;
  redirectTo: string;
  defaultStock: number;
  compact?: boolean;
}) {
  return (
    <form action={updateAdminProductStockAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <StockQuickFields defaultStock={defaultStock} compact={compact} />
    </form>
  );
}

function StockQuickFields({
  defaultStock,
  compact,
}: {
  defaultStock: number;
  compact: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <Input
        name="stock"
        type="number"
        min="0"
        step="1"
        defaultValue={String(defaultStock)}
        disabled={pending}
        className={compact ? "h-9 w-24 rounded-xl" : "h-9 w-28 rounded-xl"}
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Guardando..." : compact ? "Guardar" : "Guardar stock"}
      </Button>
    </>
  );
}

function ToggleActiveQuickForm({
  id,
  active,
  redirectTo,
}: {
  id: string;
  active: boolean;
  redirectTo: string;
}) {
  return (
    <form action={toggleAdminProductActiveAction}>
      <input type="hidden" name="productId" value={id} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="nextActive" value={active ? "false" : "true"} />
      <ToggleActiveButton active={active} />
    </form>
  );
}

function ToggleActiveButton({ active }: { active: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending}>
      {pending ? "Actualizando..." : active ? "Desactivar" : "Activar"}
    </Button>
  );
}
