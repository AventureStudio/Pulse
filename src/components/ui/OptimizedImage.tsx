"use client";

import Image from "next/image";
import { useState } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: "square" | "video" | "wide" | "portrait";
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  quality?: number;
}

const aspectRatios = {
  square: { width: 400, height: 400 },
  video: { width: 640, height: 360 },
  wide: { width: 800, height: 400 },
  portrait: { width: 400, height: 600 },
};

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  aspectRatio = "wide",
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  fill = false,
  quality = 85,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate dimensions based on aspect ratio if not provided
  const dimensions = {
    width: width || aspectRatios[aspectRatio].width,
    height: height || aspectRatios[aspectRatio].height,
  };

  // Fallback image for errors
  const fallbackSrc = `data:image/svg+xml;base64,${btoa(
    `<svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="system-ui" font-size="14">
        Image non disponible
      </text>
    </svg>`
  )}`;

  const imageClasses = `
    ${className}
    transition-all duration-300
    ${isLoading ? "opacity-0 blur-sm" : "opacity-100 blur-0"}
    ${!fill ? "max-w-full h-auto" : ""}
  `.trim();

  if (fill) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={imageError ? fallbackSrc : src}
          alt={alt}
          fill
          className="object-cover"
          sizes={sizes}
          priority={priority}
          quality={quality}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setImageError(true);
            setIsLoading(false);
          }}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <Image
        src={imageError ? fallbackSrc : src}
        alt={alt}
        width={dimensions.width}
        height={dimensions.height}
        className={imageClasses}
        sizes={sizes}
        priority={priority}
        quality={quality}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
      />
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          style={{
            width: dimensions.width,
            height: dimensions.height,
          }}
        />
      )}
    </div>
  );
}