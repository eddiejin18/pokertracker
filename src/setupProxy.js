const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Dev: CRA serves on :3000; API runs on :5001. Proxy /api → backend so fetch('/api/...') works
 * without CORS issues and matches production relative paths.
 */
module.exports = function setupProxy(app) {
  const target = process.env.PROXY_API_TARGET || 'http://127.0.0.1:5001';
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );
};
