const express = require('express');
const fetch = require('node-fetch');
const { URL } = require('url');

const app = express();

// トップページ
app.get('/', (req, res) => {
  res.send(`
    <h1>かんたんプロキシ</h1>
    <form action="/proxy" method="get">
      <input type="text" name="url" placeholder="https://example.com" style="width: 300px;" />
      <button type="submit">表示</button>
    </form>
  `);
});

// プロキシ
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('urlパラメータが必要です');

  try {
    const response = await fetch(targetUrl);
    let body = await response.text();
    const baseUrl = new URL(targetUrl);

    // href の書き換え
    body = body.replace(/href=['"]?([^'"\s>]+)['"]?/gi, (match, link) => {
      try {
        const absUrl = new URL(link, baseUrl).href;
        return `href="/proxy?url=${encodeURIComponent(absUrl)}"`;
      } catch {
        return match;
      }
    });

    // action の書き換え
    body = body.replace(/action=['"]?([^'"\s>]+)['"]?/gi, (match, actionUrl) => {
      try {
        const absUrl = new URL(actionUrl, baseUrl).href;
        return `action="/proxy?url=${encodeURIComponent(absUrl)}"`;
      } catch {
        return match;
      }
    });

    // src / href の書き換え（script, img, link用）
    body = body.replace(/(src|href)=['"]?([^'"\s>]+)['"]?/gi, (match, attr, link) => {
      try {
        const absUrl = new URL(link, baseUrl).href;
        return `${attr}="/proxy?url=${encodeURIComponent(absUrl)}"`;
      } catch {
        return match;
      }
    });

    const contentType = response.headers.get('content-type') || 'text/html';
    res.set('content-type', contentType);
    res.send(body);
  } catch (err) {
    res.status(500).send('エラーが発生しました');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
