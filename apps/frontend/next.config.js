/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only use standalone output for production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  // Ignore ESLint errors during build (for production deployment)
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ignore TypeScript errors during build (for production deployment)
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'acoustic.uz',
      },
      {
        protocol: 'https',
        hostname: 'api.acoustic.uz',
        pathname: '/uploads/**',
      },
    ],
  },
  // Removed i18n config - using cookie-based locale detection instead
  // i18n: {
  //   locales: ['uz', 'ru'],
  //   defaultLocale: 'uz',
  //   localeDetection: false,
  // },
};

module.exports = nextConfig;
