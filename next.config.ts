import type { NextConfig } from "next";


const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // 👈 Ignora errores de ESLint durante el build
  },
  output: 'export', // Habilita el modo estático (requerido para GitHub Pages)
  basePath: process.env.NODE_ENV === 'production' ? '/atechlofact' : '', // Cambia 'atechlofact' por tu nombre de repo
  assetPrefix: process.env.NODE_ENV === 'production' ? '/atechlofact/' : '', // Mismo nombre aquí
};

module.exports = nextConfig;