// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    [
      "/billing-keys",
      "/payments",
      "/subscriptions",
      "/plans",
      "/member",
      "/h2-console",
      "/board",
      "/comments",
      "/products",
    ],
    createProxyMiddleware({
      target: "http://localhost:8080",
      changeOrigin: true,
      secure: false,
      // 필요 시 cookieDomainRewrite: "localhost"
    })
  );
};
