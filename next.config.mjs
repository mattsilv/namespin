/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Enable for better UX
    optimizeCss: true,
    scrollRestoration: true,
  },
};

export default nextConfig;
