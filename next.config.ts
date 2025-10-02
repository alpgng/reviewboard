import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Prisma client için gerekli ayar
  serverExternalPackages: ["@prisma/client"],
  
  // Projenin kök dizinini belirtelim
  outputFileTracingRoot: path.join(__dirname),
  
  // ESLint kontrollerini build sırasında devre dışı bırak
  eslint: {
    // Build sırasında hataları gösterme
    ignoreDuringBuilds: true,
  },
  
  // TypeScript tip kontrollerini build sırasında devre dışı bırak
  typescript: {
    // Build sırasında tip hatalarını gösterme
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
