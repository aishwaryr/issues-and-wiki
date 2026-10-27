import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailscale host name, so `next dev` hot reload works when opened from the MacBook.
  allowedDevOrigins: ["anakin"],
};

export default nextConfig;
