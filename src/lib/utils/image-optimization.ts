export interface ImageDimensions {
  width: number;
  height: number;
}

export interface AspectRatio {
  ratio: number;
  label: string;
}

// Common aspect ratios
export const ASPECT_RATIOS: Record<string, AspectRatio> = {
  square: { ratio: 1, label: "1:1" },
  video: { ratio: 16/9, label: "16:9" },
  wide: { ratio: 2, label: "2:1" },
  portrait: { ratio: 3/4, label: "3:4" },
  golden: { ratio: 1.618, label: "Golden Ratio" },
};

// Default image sizes for different breakpoints
export const DEFAULT_SIZES = {
  mobile: { width: 375, height: 200 },
  tablet: { width: 768, height: 400 },
  desktop: { width: 1200, height: 600 },
};

/**
 * Calculate dimensions based on aspect ratio
 */
export function calculateDimensions(
  targetWidth: number,
  aspectRatio: number
): ImageDimensions {
  return {
    width: Math.round(targetWidth),
    height: Math.round(targetWidth / aspectRatio),
  };
}

/**
 * Get responsive sizes string for Next.js Image component
 */
export function getResponsiveSizes(
  breakpoints: { size: string; width: string }[] = [
    { size: "(max-width: 640px)", width: "100vw" },
    { size: "(max-width: 1024px)", width: "50vw" },
    { size: "(max-width: 1280px)", width: "33vw" },
  ]
): string {
  const sizes = breakpoints.map(bp => `${bp.size} ${bp.width}`);
  sizes.push("25vw"); // Default fallback
  return sizes.join(", ");
}

/**
 * Generate fallback dimensions when none are provided
 */
export function getFallbackDimensions(
  aspectRatio: keyof typeof ASPECT_RATIOS = "wide",
  size: "small" | "medium" | "large" = "medium"
): ImageDimensions {
  const baseWidths = {
    small: 300,
    medium: 600,
    large: 1200,
  };

  const ratio = ASPECT_RATIOS[aspectRatio]?.ratio || 2;
  return calculateDimensions(baseWidths[size], ratio);
}

/**
 * Validate image dimensions to prevent oversized images
 */
export function validateImageDimensions(
  width?: number,
  height?: number,
  maxWidth = 2000,
  maxHeight = 2000
): { isValid: boolean; adjustedDimensions?: ImageDimensions } {
  if (!width || !height) {
    return {
      isValid: false,
      adjustedDimensions: getFallbackDimensions(),
    };
  }

  if (width <= maxWidth && height <= maxHeight) {
    return { isValid: true };
  }

  // Scale down proportionally
  const aspectRatio = width / height;
  let adjustedWidth = width;
  let adjustedHeight = height;

  if (width > maxWidth) {
    adjustedWidth = maxWidth;
    adjustedHeight = adjustedWidth / aspectRatio;
  }

  if (adjustedHeight > maxHeight) {
    adjustedHeight = maxHeight;
    adjustedWidth = adjustedHeight * aspectRatio;
  }

  return {
    isValid: false,
    adjustedDimensions: {
      width: Math.round(adjustedWidth),
      height: Math.round(adjustedHeight),
    },
  };
}

/**
 * Generate blur data URL for loading placeholder
 */
export function generateBlurDataURL(
  width: number,
  height: number,
  color = "#f3f4f6"
): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}