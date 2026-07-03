/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  transpilePackages: ['maplibre-gl'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
