import type { NextConfig } from "next";

const nextConfig: any = {
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: 
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data: blob: https://pagead2.googlesyndication.com; " +
              "connect-src 'self' https://speed.cloudflare.com; " +
              "media-src 'self' blob:; " +
              "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com; " +
              "object-src 'none'; " +
              "base-uri 'self'; " +
              "form-action 'self';"
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(self), display-capture=(self), geolocation=(), interest-cohort=()"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
