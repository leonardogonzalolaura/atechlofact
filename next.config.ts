import type { NextConfig } from "next";


const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 👈 Ignora errores de ESLint durante el build
  },
  output: 'export', 
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://tools.apis.atechlo.com/apisunat',
  },
  basePath: process.env.NODE_ENV === 'production' ? '/atechlofact' : '', // Cambia 'atechlofact' por tu nombre de repo
  assetPrefix: process.env.NODE_ENV === 'production' ? '/atechlofact/' : '', // Mismo nombre aquí
};

module.exports = nextConfig;