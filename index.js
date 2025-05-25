const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(express.json());

app.use('/proxy', (req, res, next) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('urlパラメータが必要です');

  createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: () => '/',
  })(req, res, next);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
