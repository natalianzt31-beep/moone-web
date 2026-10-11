import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/egresadas", destination: "/coleccion/vestidos", permanent: true },
    ];
  },
};

export default nextConfig;
