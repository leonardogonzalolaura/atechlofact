import type { NextConfig } from "next";

// Configuración para servidor (con APIs)
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://tools.apis.atechlo.com/apisunat',
  },
};

export default nextConfig;