const cors = require('cors');
const express = require('express');
const http = require('http');

async function makeHttpServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  function health(_req, res) {
    res.json({ status: 'OK', ts: new Date() });
  }

  function root(_req, res) {
    res.json({ app: 'GraphQL Gateway', version: '1.0.0', update: '2023-05-22' });
  }

  app.get('/health', health);
  app.get('/', root);

  const httpServer = http.createServer(app);

  return {
    app,
    httpServer,
  };
}

module.exports = { makeHttpServer };
