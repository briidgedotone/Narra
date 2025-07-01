"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  placeholder?: "blur" | "empty";
  onError?:
    | ((e: React.SyntheticEvent<HTMLImageElement, Event>) => void)
    | undefined;
  onClick?: (() => void) | undefined;
  style?: React.CSSProperties;
  unoptimized?: boolean;
}

/**
 * OptimizedImage - Enhanced Next.js Image with progressive loading
 *
 * Features:
 * - Automatic blur placeholder generation
 * - Progressive loading with smooth transitions
 * - Error handling with fallback images
 * - Loading state management
 * - Optimized for performance
 */
export function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className,
  priority = false,
  sizes,
  placeholder = "blur",
  onError,
  onClick,
  style,
  unoptimized = false,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle missing src by using placeholder immediately
  const fallbackSrc = "/placeholder-post.jpg";
  const effectiveSrc = src && src.trim() ? src : fallbackSrc;
  const shouldUseFallback = !src || !src.trim() || hasError;

  // Generate a simple blur placeholder data URL
  const blurDataURL = `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e5e7eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f3f4f6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)" />
    </svg>`
  ).toString("base64")}`;

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(e);
  };

  const imageProps = {
    src: shouldUseFallback ? fallbackSrc : effectiveSrc,
    alt,
    className: cn(
      "transition-opacity duration-300",
      isLoading ? "opacity-0" : "opacity-100",
      className
    ),
    onLoad: handleLoad,
    onError: handleError,
    onClick,
    style,
    unoptimized,
    priority,
    sizes,
    ...(placeholder === "blur" &&
      !shouldUseFallback && {
        placeholder: "blur" as const,
        blurDataURL,
      }),
  };

  if (fill) {
    return <Image {...imageProps} alt={alt} fill />;
  }

  // Width and height are required when not using fill
  if (!width || !height) {
    console.warn(
      "OptimizedImage: width and height are required when fill is false"
    );
    return null;
  }

  return <Image {...imageProps} alt={alt} width={width} height={height} />;
}

/**
 * PostImage - Specialized image component for post thumbnails
 * Pre-configured for optimal post display
 */
export function PostImage({
  src,
  alt,
  className,
  onError,
  onClick,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onClick?: () => void;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={cn("object-cover", className)}
      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
      onError={onError}
      onClick={onClick}
    />
  );
}

/**
 * AvatarImage - Specialized image component for user avatars
 * Pre-configured for optimal avatar display
 */
export function AvatarImage({
  src,
  alt,
  size = 40,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  size?: number;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      sizes={`${size}px`}
    />
  );
}
