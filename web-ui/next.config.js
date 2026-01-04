const nextConfig = {
  // 移除静态导出，使用 Vercel 标准部署
  // output: 'export',
  
  // 确保 API 路由正常工作
  experimental: {
    serverActions: true,
  },
  
  // 环境变量
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
  },
};

module.exports = nextConfig;
