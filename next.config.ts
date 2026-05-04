import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== 'production';

const csp = isDev
  ? "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' ws: wss: http: https: data: blob:; frame-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  : "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; script-src 'self' 'unsafe-inline'; connect-src 'self' data: blob:; frame-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

const nextConfig: NextConfig = {
  transpilePackages: ['@react-pdf/renderer'],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
