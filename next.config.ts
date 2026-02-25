import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      // TODO: Remove images.unsplash.com once placeholder images in instagram-gallery,
      // brand-story, testimonial-carousel, and welcome-popup are replaced with real content
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
