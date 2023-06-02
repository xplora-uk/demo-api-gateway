const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express');
const createLocaleMiddleware = require('express-locale');
const helmet = require('helmet');
const http = require('http');
const requestIP = require('request-ip');
const timeout = require('connect-timeout');
const { attachProxyMiddlewareList } = require('../proxy');
const constants = require('../constants');

async function makeHttpServer(config) {
  const app = express();

  app.disable(constants.HTTP_HEADER_X_POWERED_BY);

  function logAccess(req, res, next) {
    console.info(new Date(), `${req.method} ${req.originalUrl}`);
    next();
  }

  function health(_req, res) {
    res.json({ status: 'OK', ts: new Date() });
  }

  function root(_req, res) {
    res.json({ app: 'GraphQL/API Gateway', version: '1.0.0', update: '2023-05-22' });
  }

  app.use(logAccess);

  app.use(timeout(config.http.timeoutOptions));
  app.use(cors(config.http.corsOptions));
  app.use(helmet(config.http.helmetOptions));
  app.use(requestIP.mw()); // req.clientIp is available

  app.use(cookieParser());
  app.use(createLocaleMiddleware()); // req.locale -> { source: 'default', language: 'en', region: 'GB' }

  app.use('/graphql', express.json()); // Apollo Gateway requires JSON body

  app.get('/health', health);
  app.get('/', root);

  // let's do it before JSON middleware - otherwise we need to parse JSON twice and fix some headers like content-length.
  const proxyMiddlewareList = await attachProxyMiddlewareList(config, app);

  const httpServer = http.createServer(app);

  return {
    app,
    httpServer,
    proxyMiddlewareList,
  };
}

module.exports = { makeHttpServer };
