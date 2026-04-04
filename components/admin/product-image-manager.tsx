"use client";

import { useFormStatus } from "react-dom";
import { Trash2, Upload, ImageIcon, Plus } from "lucide-react";

import {
  deleteAdminProductCoverAction,
  deleteAdminProductGalleryImageAction,
  appendAdminProductGalleryImagesAction,
  uploadStandaloneAdminProductCoverAction,
} from "@/app/admin/productos/actions";
import { resolveProductMediaUrl } from "@/lib/supabase/storage";
import { Button } from "@/components/ui/button";

export function AdminProductImageManager({
  productId,
  coverImagePath,
  galleryImagePaths,
}: {
  productId: string;
  coverImagePath?: string | null;
  galleryImagePaths: string[];
}) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-black/20 p-5 md:p-6 mt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
            Gestión Multimedia
          </p>
          <h2 className="mt-3 font-heading text-2xl font-semibold text-white">
            Imágenes del Producto
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Los cambios en esta sección se guardan solos. No necesitas pulsar el botón de guardar
            general.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Portada Principal</h3>
          <div className="overflow-hidden rounded-[22px] border border-white/10 bg-black/40">
            {coverImagePath ? (
              <div className="group relative aspect-[3/4] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveProductMediaUrl(coverImagePath)}
                  alt="Portada del producto"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <form action={deleteAdminProductCoverAction}>
                    <input type="hidden" name="productId" value={productId} />
                    <FormDeleteButton label="Borrar portada" />
                  </form>
                </div>
              </div>
            ) : (
              <div className="flex aspect-[3/4] w-full flex-col items-center justify-center p-6 text-center">
                <ImageIcon className="mb-3 h-8 w-8 text-slate-600" />
                <p className="text-xs text-slate-400">Sin portada principal</p>
                
                <form action={uploadStandaloneAdminProductCoverAction} className="mt-4 w-full">
                  <input type="hidden" name="productId" value={productId} />
                  <label className="block w-full cursor-pointer rounded-full bg-white/[0.04] px-4 py-2.5 text-center text-xs font-semibold text-white transition-colors hover:bg-white/[0.08]">
                    Subir foto
                    <input
                      type="file"
                      name="coverImage"
                      accept="image/webp,image/png,image/jpeg"
                      required
                      className="hidden"
                      onChange={(e) => {
                        // Subida automatica al seleccionar en navegador
                        if (e.target.form) e.target.form.requestSubmit();
                      }}
                    />
                  </label>
                  <SubmitStatusMessage />
                </form>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-200">Galería Extra ({galleryImagePaths.length})</h3>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {/* Fotos existentes */}
            {galleryImagePaths.map((path) => (
              <div
                key={path}
                className="group relative aspect-square overflow-hidden rounded-[20px] border border-white/10 bg-black/40"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveProductMediaUrl(path)}
                  alt="Foto galería"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <form action={deleteAdminProductGalleryImageAction}>
                    <input type="hidden" name="productId" value={productId} />
                    <input type="hidden" name="storagePath" value={path} />
                    <FormDeleteButton label="Borrar foto" />
                  </form>
                </div>
              </div>
            ))}

            {/* Añadir nuevas a la galeria */}
            <form
              action={appendAdminProductGalleryImagesAction}
              className="flex aspect-square flex-col items-center justify-center rounded-[20px] border border-dashed border-white/10 bg-white/[0.02] p-4 text-center transition-colors hover:bg-white/[0.04]"
            >
              <input type="hidden" name="productId" value={productId} />
              
              <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                  <Plus className="h-5 w-5 text-slate-400" />
                </div>
                <span className="text-[11px] font-medium text-slate-400">Añadir foto extra</span>
                <input
                  type="file"
                  name="galleryImages"
                  accept="image/webp,image/png,image/jpeg"
                  multiple
                  required
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.form) e.target.form.requestSubmit();
                  }}
                />
              </label>
              <SubmitStatusMessage />
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function FormDeleteButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex flex-col items-center gap-2 text-rose-400 transition-colors hover:text-rose-300 disabled:opacity-50"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20 backdrop-blur-md">
        <Trash2 className="h-4 w-4" />
      </div>
      <span className="text-xs font-semibold">{pending ? "Borrando..." : label}</span>
    </button>
  );
}

function SubmitStatusMessage() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return <span className="mt-2 text-[10px] text-primary">Subiendo...</span>;
}
