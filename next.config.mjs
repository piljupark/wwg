/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['maps.googleapis.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // TypeScript 오류 무시
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLint 오류 무시
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /node_modules\/undici/ },
    ];
    return config;
  },
}

export default nextConfig