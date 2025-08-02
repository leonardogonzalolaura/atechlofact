import type { NextConfig } from "next";


const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Comentar output export para desarrollo
  // output: 'export',
  // trailingSlash: true,
  // images: {
  //   unoptimized: true
  // },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://tools.apis.atechlo.com/apisunat',
  },
  // basePath: process.env.NODE_ENV === 'production' ? '/atechlofact' : '',
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/atechlofact/' : '',
};

module.exports = nextConfig;