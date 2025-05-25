const express = require('express');
const fetch = require('node-fetch');
const { URL } = require('url');

const app = express();

// ルートにアクセスしたらメッセージを返す
app.get('/', (req, res) => {
  res.send('プロキシサーバーが動いています');
});

// /proxy?url=指定URL でHTML取得してリンク・フォームをプロキシ経由に書き換え
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('urlパラメータが必要です');

  try {
    const response = await fetch(targetUrl);
    let body = await response.text();

    const baseUrl = new URL(targetUrl);

    // hrefリンクの書き換え（絶対・相対URL対応）
    body = body.replace(/href=['"]?([^'"\s>]+)['"]?/gi, (match, link) => {
      try {
        const absUrl = new URL(link, baseUrl).href;
        return `href="/proxy?url=${encodeURIComponent(absUrl)}"`;
      } catch {
        return match;
      }
    });

    // フォームのaction属性書き換え
    body = body.replace(/action=['"]?([^'"\s>]+)['"]?/gi, (match, actionUrl) => {
      try {
        const absUrl = new URL(actionUrl, baseUrl).href;
        return `action="/proxy?url=${encodeURIComponent(absUrl)}"`;
      } catch {
        return match;
      }
    });

    // 必要なら画像やスクリプトのsrc属性も同様に書き換え可能

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
