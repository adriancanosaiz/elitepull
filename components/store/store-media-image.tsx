"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";

type StoreMediaImageProps = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc: string;
};

function isRemoteStorageImage(src: string) {
  return (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/storage/v1/object/public/")
  );
}

export function StoreMediaImage({
  src,
  fallbackSrc,
  alt,
  unoptimized,
  ...props
}: StoreMediaImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      unoptimized={unoptimized ?? isRemoteStorageImage(currentSrc)}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
