/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'github.com'],
  },
  // Enable experimental features for OG image generation
  experimental: {
    // This helps with Edge Runtime compatibility
  },
}

module.exports = nextConfig

