const express = require('express');
const data = require('./data');

main();

async function main() {
  const app = express();

  app.use(express.json());

  function listAuctions(_req, res) {
    res.json({ data: data.auctions });
  }

  function health(_req, res) {
    res.json({ status: 'OK', ts: new Date() });
  }

  function root(_req, res) {
    res.json({ app: 'Auction API', version: '1.0.0', update: '2023-05-22' });
  }

  app.get('/auctions/v1/auctions', listAuctions);
  app.get('/health', health);
  app.get('/', root);

  app.disable('x-powered-by');

  app.listen(16001, () => {
    console.log('Auction API listening on port 16001!');
  });
}
