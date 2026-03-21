/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable React Server Components
    serverComponentsExternalPackages: ['@supabase/ssr'],
    // Optimize chunking
    optimizePackageImports: ['lucide-react', '@headlessui/react'],
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          }
        ]
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          vendor: {
            test: /[\\\//]node_modules[\\\//]/,
            name: 'vendors',
            chunks: 'all',
            enforce: true,
            priority: 10,
          },
          common: {
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            priority: 5,
          },
        },
      },
    };

    // Tree shaking optimizations
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/components/ui': require('path').resolve(__dirname, 'src/components/ui'),
      };
    }

    return config;
  },
  
  // Build optimizations
  env: {
    CUSTOM_KEY: 'performance-optimized',
  },
  
  // Reduce JavaScript output
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;