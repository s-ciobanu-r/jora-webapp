/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  env: {
    NEXT_PUBLIC_JORA_API_BASE: process.env.NEXT_PUBLIC_JORA_API_BASE,
    NEXT_PUBLIC_JORA_FRONTEND_API_KEY: process.env.NEXT_PUBLIC_JORA_FRONTEND_API_KEY,
  },
};

export default nextConfig;
