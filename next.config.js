/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Cloudflare Pages serves images statically; without a runtime image optimizer,
  // we disable Next/Image optimization in favor of plain <img>-equivalent output.
  images: {
    unoptimized: true,
  },
  // Required for @cloudflare/next-on-pages: the adapter intercepts the Vercel
  // build output, so we keep the Vercel output mode enabled.
  experimental: {
    // Ensures the build emits the .vercel/output directory used by the adapter.
  },
};

module.exports = nextConfig;
