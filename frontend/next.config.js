/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_AVALANCHE_RPC: process.env.NEXT_PUBLIC_AVALANCHE_RPC || 'http://localhost:9650',
  },
}

module.exports = nextConfig
