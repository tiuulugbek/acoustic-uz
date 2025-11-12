/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only use standalone output for production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'acoustic.uz',
      },
      {
        protocol: 'https',
        hostname: 'api.acoustic.uz',
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
