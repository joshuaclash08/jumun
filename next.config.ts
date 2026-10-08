import type { NextConfig } from "next";
import os from "os";

// Automatically include local network IPv4 addresses so mobile testing works across different Wi-Fi networks
const localIps = Object.values(os.networkInterfaces())
  .flat()
  .filter((iface): iface is os.NetworkInterfaceInfo => Boolean(iface && iface.family === "IPv4" && !iface.internal))
  .map((iface) => iface.address);

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "jumun.sharingurl.com",
    "*.sharingurl.com",
    "172.30.40.227",
    "192.168.45.24",
    "172.30.1.42",
    "localhost",
    "127.0.0.1",
    ...localIps,
  ],
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  async redirects() {
    return [
      {
        source: "/setting",
        destination: "/settings",
        permanent: true,
      },
      {
        source: "/setting/:path*",
        destination: "/settings/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
