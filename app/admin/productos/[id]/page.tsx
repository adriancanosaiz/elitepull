import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, Boxes } from "lucide-react";

import {
  deleteAdminProductAction,
  updateAdminProductAction,
} from "@/app/admin/productos/actions";
import { DeleteProductForm } from "@/components/admin/delete-product-form";
import {
  replaceAdminProductGalleryAction,
  uploadAdminProductCoverAction,
} from "@/app/admin/productos/media/actions";
import { ProductMediaUploader } from "@/components/admin/product-media-uploader";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { getAdminProductCatalogOptions } from "@/lib/admin/catalog-taxonomy";
import { getAdminProductById } from "@/lib/admin/products";

type ProductEditPageParams = Promise<{
  id: string;
}>;

type ProductEditPageSearchParams = Promise<{
  error?: string;
  success?: string;
  mediaError?: string;
  mediaSuccess?: string;
}>;

export default async function AdminEditProductPage({
  params,
  searchParams,
}: {
  params: ProductEditPageParams;
  searchParams: ProductEditPageSearchParams;
}) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const [catalogOptions, product] = await Promise.all([
    getAdminProductCatalogOptions(),
    getAdminProductById(id),
  ]);

  if (!product) {
    notFound();
  }

  const resolvedProduct = product;

  const successMessage =
    resolvedSearchParams.success === "updated"
      ? "Producto actualizado correctamente."
      : resolvedSearchParams.success === "created"
        ? "Producto creado correctamente."
        : resolvedSearchParams.success === "created-with-media"
          ? "Producto creado correctamente con portada y galeria inicial."
          : undefined;

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-white/10 bg-black/20 p-6 md:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/75">
              Edicion de producto
            </p>
            <h1 className="mt-3 font-heading text-3xl font-semibold text-white">
              {resolvedProduct.name}
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-300">
              <span>Slug: <span className="text-white">{resolvedProduct.slug}</span></span>
              <span>SKU: <span className="text-white">{resolvedProduct.sku}</span></span>
              <span>Marca: <span className="text-white">{resolvedProduct.brandLabel}</span></span>
              <span>Expansion: <span className="text-white">{resolvedProduct.expansionLabel}</span></span>
              <span>Formato: <span className="text-white">{resolvedProduct.formatLabel}</span></span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="outline" size="lg">
              <Link href="/admin/productos">
                <ArrowLeft className="h-4 w-4" />
                Volver al listado
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/producto/${resolvedProduct.slug}`}>
                <Boxes className="h-4 w-4" />
                Ver PDP
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <ProductForm
        mode="edit"
        action={updateAdminProductAction}
        catalogOptions={catalogOptions}
        product={resolvedProduct}
        error={resolvedSearchParams.error}
        success={successMessage}
      />

      <ProductMediaUploader
        productId={resolvedProduct.id}
        coverImagePath={resolvedProduct.coverImagePath}
        galleryImageCount={resolvedProduct.galleryImagePaths.length}
        uploadCoverAction={uploadAdminProductCoverAction}
        replaceGalleryAction={replaceAdminProductGalleryAction}
        mediaError={resolvedSearchParams.mediaError}
        mediaSuccess={resolvedSearchParams.mediaSuccess}
      />

      <section className="rounded-[30px] border border-rose-400/20 bg-rose-500/5 p-6 md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-rose-200/80">
              <AlertTriangle className="h-4 w-4" />
              Zona sensible
            </p>
            <h2 className="mt-3 font-heading text-2xl font-semibold text-white">
              Eliminar producto
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Esta accion elimina el producto del catalogo y del admin. El historial de pedidos no
              se borra, pero el producto dejara de estar vinculado en futuras consultas.
            </p>
          </div>

          <DeleteProductForm
            action={deleteAdminProductAction}
            productId={resolvedProduct.id}
            redirectTo={`/admin/productos/${resolvedProduct.id}`}
            productName={resolvedProduct.name}
          />
        </div>
      </section>
    </div>
  );
}
