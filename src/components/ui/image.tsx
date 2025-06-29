"use client";

import NextImage from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fallbackSrc?: string;
  unoptimized?: boolean;
  fill?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 300,
  className = "",
  fallbackSrc = "/placeholder-post.jpg",
  unoptimized = false,
  fill = false,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);

  const imageProps = {
    src: error ? fallbackSrc : src,
    alt,
    className,
    unoptimized,
    onError: () => setError(true),
    ...(fill
      ? { fill: true }
      : {
          width,
          height,
        }),
  };

  return <NextImage {...imageProps} />;
} 