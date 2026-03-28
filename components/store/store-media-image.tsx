"use client";

import { useEffect, useState } from "react";
import Image, { type ImageProps } from "next/image";

type StoreMediaImageProps = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc: string;
};

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
      unoptimized={unoptimized ?? false}
      onError={() => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
