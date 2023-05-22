const { expressMiddleware } = require('@apollo/server/express4');
const { makeConfig } = require('./config');
const { makeEnvSettings } = require('./env');
const { makeGraphqlServer } = require('./graphql');
const { makeHttpServer } = require('./http');

async function makeFactory() {
  const penv = await makeEnvSettings();

  const config = await makeConfig(penv);

  const { app, httpServer } = await makeHttpServer(config);

  const { gqlServer, gqlGateway, middlewareOptions } = await makeGraphqlServer(config, httpServer);

  await gqlServer.start();

  app.use('/graphql', expressMiddleware(gqlServer, middlewareOptions));

  return {
    penv,
    config,
    app,
    httpServer,
    gqlGateway,
    gqlServer,
  };
}

module.exports = { makeFactory };
