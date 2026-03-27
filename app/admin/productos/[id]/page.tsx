import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Boxes } from "lucide-react";

import { updateAdminProductAction } from "@/app/admin/productos/actions";
import {
  replaceAdminProductGalleryAction,
  uploadAdminProductCoverAction,
} from "@/app/admin/productos/media/actions";
import { ProductMediaUploader } from "@/components/admin/product-media-uploader";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { getAdminCategories, getAdminProductById } from "@/lib/admin/products";

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
  const [categories, product] = await Promise.all([
    getAdminCategories(),
    getAdminProductById(id),
  ]);

  if (!product) {
    notFound();
  }

  const resolvedProduct = product;

  const successMessage =
    resolvedSearchParams.success === "updated"
      ? "Producto actualizado correctamente."
      : undefined;

  async function updateProductFormAction(formData: FormData) {
    "use server";

    return updateAdminProductAction(resolvedProduct.id, formData);
  }

  async function uploadCoverFormAction(formData: FormData) {
    "use server";

    return uploadAdminProductCoverAction(resolvedProduct.id, formData);
  }

  async function replaceGalleryFormAction(formData: FormData) {
    "use server";

    return replaceAdminProductGalleryAction(resolvedProduct.id, formData);
  }

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
              <span>Categoria: <span className="text-white">{resolvedProduct.categoryLabel}</span></span>
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
        action={updateProductFormAction}
        categories={categories}
        product={resolvedProduct}
        error={resolvedSearchParams.error}
        success={successMessage}
      />

      <ProductMediaUploader
        productId={resolvedProduct.id}
        coverImagePath={resolvedProduct.coverImagePath}
        galleryImageCount={resolvedProduct.galleryImagePaths.length}
        uploadCoverAction={uploadCoverFormAction}
        replaceGalleryAction={replaceGalleryFormAction}
        mediaError={resolvedSearchParams.mediaError}
        mediaSuccess={resolvedSearchParams.mediaSuccess}
      />
    </div>
  );
}
