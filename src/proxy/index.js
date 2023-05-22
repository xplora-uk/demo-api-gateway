const { createProxyMiddleware,  } = require('http-proxy-middleware');
const constants = require('../constants');

// side-effect on express app
function attachProxyMiddlewareList(config, app) {
  const proxyMiddlewareList = [];

  function makeErrorHandler() {
    function onError(err, req, res) {
      console.error(`Proxy error: ${err.message}`);
    }

    return onError;
  }

  function makeProxyReqHandler({ pathFilter, target, isPublic }) {

    async function onProxyReq(proxyReq, req, res) {
      console.info('Proxying request to', target, 'for', req.originalUrl);
      if (!isPublic) {
        const token = String(req.get(constants.HTTP_HEADER_H_AUTHORIZATION) || '').trim();
        if (token === '') {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }

        // TODO: validate auth token using Auth API
        //proxyReq.setHeader(constants.HTTP_HEADER_X_XPLORA_USER_ID, user.id);
        //proxyReq.setHeader(constants.HTTP_HEADER_X_XPLORA_USER_RID, user.rid);
      }

      // inject client IP address
      proxyReq.setHeader(constants.HTTP_HEADER_X_XPLORA_IP, req.clientIp);

      // inject locale information
      const { source = 'default', language = 'en', region = 'GB' } = req.locale || {};
      proxyReq.setHeader(constants.HTTP_HEADER_X_XPLORA_LANGUAGE, language);
      proxyReq.setHeader(constants.HTTP_HEADER_X_XPLORA_REGION, region);
    }

    return onProxyReq;
  }

  for (let p of config.http.proxyList) {
    console.info(`Proxying ${p.prefix} to ${p.target} (public: ${p.isPublic?'yes':'no'})`);
    const proxyMiddleware = createProxyMiddleware({
      changeOrigin: true,
      target: p.target,
      pathRewrite: {
        ['^' + p.prefix]: p.prefix,
      },
      onProxyReq: makeProxyReqHandler(p),
      on: {
        error: makeErrorHandler(p),
      },
      timeout: config.proxy.timeoutInMilliseconds,
    });
    proxyMiddlewareList.push(proxyMiddleware);

    // attach proxy middleware to express
    app.use(p.prefix, proxyMiddleware);
  }

  return proxyMiddlewareList;
}

module.exports = { attachProxyMiddlewareList };
