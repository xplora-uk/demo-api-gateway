const express = require('express');
const data = require('./data');

main();

async function main() {
  const app = express();

  app.use(express.json());

  function listNewsArticles(_req, res) {
    res.json({ data: data.articles });
  }

  function health(_req, res) {
    res.json({ status: 'OK', ts: new Date() });
  }

  function root(_req, res) {
    res.json({ app: 'News API', version: '1.0.0', update: '2023-05-22' });
  }

  app.get('/news/v2/articles', listNewsArticles);
  app.get('/health', health);
  app.get('/', root);

  app.disable('x-powered-by');

  app.listen(16002, () => {
    console.log('News API listening on port 16002!');
  });
}
