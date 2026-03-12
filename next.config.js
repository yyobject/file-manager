/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb', // Server Actions 最大 100MB
    },
    // Next.js 15 新增：Middleware 请求体大小限制
    middlewareClientMaxBodySize: '100mb',
  },
}

module.exports = nextConfig
