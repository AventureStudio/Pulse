/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ["@aventure-studio/bob"],
  images: {
    // Modern image formats for better compression
    formats: ['image/webp', 'image/avif'],
    // Responsive image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Quality settings
    quality: 85,
    // Optimize images with Next.js built-in loader
    loader: 'default',
    // Security: only allow images from trusted domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Minimize layout shift
    minimumCacheTTL: 60,
    // Enable progressive JPEG
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}