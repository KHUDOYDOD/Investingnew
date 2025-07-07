/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [],
  images: {
    domains: ['placeholder.svg'],
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

export default nextConfig
