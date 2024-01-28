const { expressMiddleware } = require('@apollo/server/express4');
const { createTerminus, HealthCheckError } = require('@godaddy/terminus');
const { makeConfig } = require('./config');
const { makeEnvSettings } = require('./env');
const { makeHttpServer } = require('./http');
const { makeGraphqlServer } = require('./graphql');
const { makeLogger } = require('./logger');
const { makeJwtService } = require('./security');

async function makeFactory() {
  const penv = await makeEnvSettings();

  const config = await makeConfig(penv);

  const logger = makeLogger(config);

  const jwtService = makeJwtService(config, logger);

  const { app, httpServer } = await makeHttpServer(config, logger, jwtService);

  const { gqlServer, gqlGateway, middlewareOptions } = await makeGraphqlServer(config, logger, httpServer, jwtService);

  await gqlServer.start();

  app.use('/graphql', expressMiddleware(gqlServer, middlewareOptions));

  async function onHealthCheck() {
    const errors = [];
    return Promise.all(
      [
        authRwDb.healthCheck(),
        authRoDb.healthCheck(),
        coreRwDb.healthCheck(),
        coreRoDb.healthCheck(),
      ].map(p => p.catch(error => {
        // silently collecting all possible errors
        errors.push(error);
        return undefined;
      }))
    ).then(() => {
      if (errors.length) {
        throw new HealthCheckError('healthcheck failed', errors)
      }
    });
  }

  createTerminus(httpServer, {
    signal: 'SIGINT',
    healthChecks: { '/healthcheck': onHealthCheck },
    onSignal,
    timeout: 5 * 1000, // 5 seconds
  });

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
