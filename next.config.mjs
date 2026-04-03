/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // pg is a Node.js package used by the realtime listener
    serverComponentsExternalPackages: ["pg"],
  },
}

export default nextConfig
