import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "utfs.io", // For UploadThing avatars
      }
    ],
    // This entirely disables the Next.js image optimization server,
    // stopping all TimeoutErrors and making images load instantly
    unoptimized: true, 
  },
};

export default nextConfig;