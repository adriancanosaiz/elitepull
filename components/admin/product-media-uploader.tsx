"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

const fileInputClassName =
  "block w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-white/[0.08] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white";

export function ProductMediaUploader({
  productId,
  coverImagePath,
  galleryImageCount,
  uploadCoverAction,
  replaceGalleryAction,
  mediaError,
  mediaSuccess,
}: {
  productId: string;
  coverImagePath?: string;
  galleryImageCount: number;
  uploadCoverAction: (formData: FormData) => void | Promise<void>;
  replaceGalleryAction: (formData: FormData) => void | Promise<void>;
  mediaError?: string;
  mediaSuccess?: string;
}) {
  const currentCoverPath = coverImagePath?.trim() || "Sin portada en BD";
  const coverPathExample = `products/${productId}/cover.{ext}`;
  const galleryPathExample = `products/${productId}/gallery/01.{ext}`;
  const secondGalleryPathExample = `products/${productId}/gallery/02.{ext}`;

  return (
    <section className="rounded-[30px] border border-white/10 bg-black/20 p-5 md:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200/75">
        Media uploader V1
      </p>
      <h2 className="mt-3 font-heading text-2xl font-semibold text-white">
        Portada y galeria desde el admin
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
        Este bloque sube directamente a Supabase Storage y actualiza las rutas del producto.
        La portada se reemplaza y la galeria se regenera completa respetando el orden de
        seleccion.
      </p>

      {mediaError ? <Notice tone="error">{mediaError}</Notice> : null}
      {mediaSuccess ? <Notice tone="success">{getSuccessMessage(mediaSuccess)}</Notice> : null}

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Convencion de paths
          </p>
          <div className="mt-4 space-y-2 font-mono text-xs text-slate-200">
            <p>{coverPathExample}</p>
            <p>{galleryPathExample}</p>
            <p>{secondGalleryPathExample}</p>
          </div>
          <div className="mt-5 space-y-2 text-sm leading-6 text-slate-300">
            <p>
              <span className="text-slate-400">Product ID:</span>{" "}
              <span className="text-white">{productId}</span>
            </p>
            <p>
              <span className="text-slate-400">Portada actual:</span>{" "}
              <span className="break-all text-white">{currentCoverPath}</span>
            </p>
            <p>
              <span className="text-slate-400">Galeria actual:</span>{" "}
              <span className="text-white">
                {galleryImageCount} {galleryImageCount === 1 ? "imagen" : "imagenes"}
              </span>
            </p>
          </div>
          <div className="mt-5 rounded-[22px] border border-white/10 bg-black/20 p-4 text-xs leading-6 text-slate-400">
            <p>Formatos V1: webp, png, jpg, jpeg.</p>
            <p>Limite: 8 MB por archivo.</p>
            <p>La extension final se conserva segun el archivo subido.</p>
            <p>Este es el flujo principal de media; ya no necesitas escribir paths manuales.</p>
          </div>
        </div>

        <div className="space-y-4">
          <form
            action={uploadCoverAction}
            className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5"
          >
            <input type="hidden" name="productId" value={productId} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Portada
            </p>
            <h3 className="mt-3 text-lg font-semibold text-white">Subir o reemplazar cover</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Sube una unica imagen. Si ya existe una portada, esta accion la sustituye.
            </p>
            <div className="mt-5 space-y-3">
              <input
                name="coverImage"
                type="file"
                accept="image/webp,image/png,image/jpeg"
                className={fileInputClassName}
                required
              />
              <CoverSubmitButton />
            </div>
          </form>

          <form
            action={replaceGalleryAction}
            className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5"
          >
            <input type="hidden" name="productId" value={productId} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Galeria
            </p>
            <h3 className="mt-3 text-lg font-semibold text-white">Reemplazar galeria completa</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Selecciona varias imagenes a la vez. El orden final depende del orden de seleccion
              y la galeria actual se reemplaza entera.
            </p>
            <div className="mt-5 space-y-3">
              <input
                name="galleryImages"
                type="file"
                accept="image/webp,image/png,image/jpeg"
                multiple
                className={fileInputClassName}
                required
              />
              <GallerySubmitButton />
            </div>
          </form>
        </div>
      </div>
    </section>
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
        "mt-6 rounded-[24px] border px-4 py-3 text-sm leading-6",
        tone === "error"
          ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
          : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function CoverSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Subiendo portada..." : "Subir portada"}
    </Button>
  );
}

function GallerySubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" variant="outline" disabled={pending}>
      {pending ? "Reemplazando galeria..." : "Reemplazar galeria"}
    </Button>
  );
}

function getSuccessMessage(code: string) {
  switch (code) {
    case "cover-uploaded":
      return "Portada subida correctamente.";
    case "gallery-replaced":
      return "Galeria reemplazada correctamente.";
    default:
      return "Media actualizada correctamente.";
  }
}
