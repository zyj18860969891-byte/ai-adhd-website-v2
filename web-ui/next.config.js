/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
    NEXT_PUBLIC_MCP_CHURNFLOW_URL: process.env.NEXT_PUBLIC_MCP_CHURNFLOW_URL,
    NEXT_PUBLIC_MCP_SHRIMP_URL: process.env.NEXT_PUBLIC_MCP_SHRIMP_URL,
  },
};

module.exports = nextConfig;