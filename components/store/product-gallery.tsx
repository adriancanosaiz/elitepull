"use client";

import { useState } from "react";

import { StoreMediaImage } from "@/components/store/store-media-image";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
  fallbackSrc,
}: {
  images: string[];
  name: string;
  fallbackSrc: string;
}) {
  const [activeImage, setActiveImage] = useState(images[0] ?? "");

  return (
    <div className="space-y-4">
      <div className="surface-card overflow-hidden p-4">
        <div className="relative rounded-[28px] border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-transparent p-6">
          <StoreMediaImage
            src={activeImage}
            fallbackSrc={fallbackSrc}
            alt={name}
            width={900}
            height={1100}
            className="mx-auto h-[420px] w-auto object-contain md:h-[560px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveImage(image)}
            className={cn(
              "surface-soft overflow-hidden p-2 transition-colors",
              activeImage === image && "border-primary/30 bg-primary/10",
            )}
          >
            <StoreMediaImage
              src={image}
              fallbackSrc={fallbackSrc}
              alt={`${name} miniatura ${index + 1}`}
              width={220}
              height={260}
              className="h-24 w-full rounded-[18px] object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
