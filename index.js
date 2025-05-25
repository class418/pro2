const express = require('express');
const fetch = require('node-fetch'); // v2系を使う

const app = express();

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('urlパラメータが必要です');
  }
app.get('/', (req, res) => {
  res.send('プロキシサーバーが動いています');
});
  
  try {
    const response = await fetch(targetUrl);
    // 元のレスポンスのcontent-typeをそのまま渡す
    const contentType = response.headers.get('content-type') || 'text/html';
    res.set('content-type', contentType);

    // バイナリやテキストの判断を簡単に、ここではテキストとして返す
    const body = await response.text();
    res.send(body);
  } catch (error) {
    res.status(500).send('プロキシでエラーが発生しました');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
