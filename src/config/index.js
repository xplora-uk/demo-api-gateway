const constants = require('../constants');

function makeConfig(penv) {

  let httpPort = Number.parseInt(penv.HTTP_PORT || '15000');
  if (Number.isNaN(httpPort) || httpPort < 0 || httpPort > 65535) httpPort = 15000;

  const httpCorsOptions = {
    methods          : 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    maxAge           : 60 * 60 * 24,
    exposedHeaders   : [
      constants.HTTP_HEADER_H_ACCESS_TOKEN,
      constants.HTTP_HEADER_H_ACCESS_TOKEN_EXPIRE,
    ],
  };

  const httpHelmetOptions = {
    contentSecurityPolicy : {
      directives: {
        'script-src': ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'http:'],
      },
    },
    crossOriginResourcePolicy: { 
      policy: 'cross-origin',
    },
  };

  const httpBodyParserOptions = {
    jsonOptions: {
      // request body size limit
      limit: 10 * 1024 * 1024, // 10MB
    },
  };

  const httpRequestTimeoutInSeconds = 30;
  const timeoutOptions = `${httpRequestTimeoutInSeconds}s`;

  // ----
  const federation = [];

  const subgraphCount = Number.parseInt(penv.SUBGRAPH_COUNT || '0');
  if (Number.isNaN(subgraphCount) || subgraphCount < 0) throw new Error('SUBGRAPH_COUNT must be a positive integer');

  for (let i = 1; i <= subgraphCount; i++) {
    const name = penv[`SUBGRAPH_${i}_NAME`] || '';
    if (!name) throw new Error(`SUBGRAPH_${i}_NAME must be set`);

    const url = penv[`SUBGRAPH_${i}_URL`] || '';
    if (!url) throw new Error(`SUBGRAPH_${i}_URL must be set`);

    federation.push({ name, url });
  }

  // ----
  const proxyList = [];

  const proxyCount = Number.parseInt(penv.PROXY_COUNT || '0');
  if (Number.isNaN(proxyCount) || proxyCount < 0) throw new Error('PROXY_COUNT must be a positive integer');

  for (let i = 1; i <= proxyCount; i++) {
    const prefix = penv[`PROXY_${i}_PREFIX`] || '';
    if (!prefix) throw new Error(`PROXY_${i}_PREFIX must be set`);
    
    const target = penv[`PROXY_${i}_TARGET`] || '';
    if (!target) throw new Error(`PROXY_${i}_TARGET must be set`);

    let isPublic = Number.parseInt(penv[`PROXY_${i}_PUBLIC`] || '0');
    if (Number.isNaN(isPublic) || isPublic < 0) isPublic = 0;
    isPublic = isPublic > 0; // turn it to boolean

    proxyList.push({ prefix, target, isPublic });
  }
  // ----

  return {
    http: {
      port: httpPort,
      proxyList,
      corsOptions      : httpCorsOptions,
      helmetOptions    : httpHelmetOptions,
      bodyParserOptions: httpBodyParserOptions,
      timeoutOptions,
      requestTimeoutInSeconds: httpRequestTimeoutInSeconds,
    },
    proxy: {
      timeoutInMilliseconds: (httpRequestTimeoutInSeconds - 1) * 1000
    },
    graphql: {
      federation,
    },
  };
}

module.exports = { makeConfig };
