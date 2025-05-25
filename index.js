const express = require('express');
const fetch = require('node-fetch');

const app = express();

// ① ルートにアクセスしたらメッセージを返す
app.get('/', (req, res) => {
  res.send('プロキシサーバーが動いています');
});

// ② /proxy?url=で指定したURLのHTMLを取得してリンクを書き換えて返す
app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('urlパラメータが必要です');

  try {
    const response = await fetch(targetUrl);
    let body = await response.text();

    // hrefリンクを書き換え
    body = body.replace(/href="(http[^"]*)"/g, (match, p1) => {
      return `href="/proxy?url=${encodeURIComponent(p1)}"`;
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
