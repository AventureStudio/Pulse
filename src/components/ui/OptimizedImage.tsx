"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  sizes,
  fill = false,
  objectFit = "cover",
  placeholder = "empty",
  blurDataURL,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div
        className={`bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center ${className}`}
        style={fill ? {} : { width, height }}
      >
        <span className="text-xs text-gray-400">Image non disponible</span>
      </div>
    );
  }

  const imageProps = {
    src,
    alt,
    className: `${className} ${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`,
    priority,
    sizes,
    onLoad: handleLoad,
    onError: handleError,
    style: fill ? {} : { objectFit },
    ...(placeholder === "blur" && blurDataURL ? { placeholder, blurDataURL } : {}),
  };

  return (
    <div className={fill ? "relative" : ""} style={fill ? {} : { width, height }}>
      {isLoading && (
        <div
          className={`absolute inset-0 bg-gray-100 animate-pulse rounded-lg ${fill ? "" : "z-10"}`}
          style={fill ? {} : { width, height }}
        />
      )}
      {fill ? (
        <Image {...imageProps} fill />
      ) : (
        <Image {...imageProps} width={width} height={height} />
      )}
    </div>
  );
}