const { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } = require('@apollo/gateway');
const { ApolloServer } = require('@apollo/server');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { HTTP_HEADER_H_BACKDOOR_AUTHORIZATION, HTTP_HEADER_AUTHORIZATION, HTTP_HEADER_X_XPLORA_USER_RID, HTTP_HEADER_H_DATE, HTTP_HEADER_H_TRANSACTION_ID } = require('../constants');

async function makeGraphqlServer(config, logger, httpServer, jwtService) {

  class AuthenticatedDataSource extends RemoteGraphQLDataSource {
    willSendRequest({ request, context }) {
      // Outgoing request to the component of the Federation e.g. gw-core
      // For security reasons we want to keep the existing logic and precautions as they are
      logger.log({ msg: 'passing to subgraph', context });
      request.http.headers.set(HTTP_HEADER_H_BACKDOOR_AUTHORIZATION, context.authToken); // useful for gw-core
      request.http.headers.set(HTTP_HEADER_H_TRANSACTION_ID, context.txnId); // useful for gw-core

      request.http.headers.set(HTTP_HEADER_X_XPLORA_USER_RID, context.userRid); // useful for gql-people
    }
  }

  const gqlGateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: config.graphql.federation,
    }),
    buildService({ name, url }) {
      return new AuthenticatedDataSource({ name, url });
    },
  });

  const gqlServer = new ApolloServer({
    gateway: gqlGateway,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
    ],
  });

  // for express middleware
  const middlewareOptions = {
    context: async ({ req }) => {
      // TODO: security check: validate auth token, decode it, extract userRid, inject into context
      // TODO: use secure JWT
      // we need to pass relevant data to the components of the Federation
      logger.log({ msg: 'new request headers', headers: req.headers });
      const rawJwtHeaderValue = req.get(HTTP_HEADER_AUTHORIZATION) || '';
      const [bearer, jwtValue] = rawJwtHeaderValue.split(' ');
      const isJwtValid = jwtService.validateJwt(jwtValue);

      return {
        // Legacy headers
        authToken: req.get(HTTP_HEADER_H_BACKDOOR_AUTHORIZATION) || '',
        txnId    : req.get(HTTP_HEADER_H_TRANSACTION_ID) || '',

        // New data points
        // TODO: replace with the actual userRid read from validated JWT
        userRid     : req.get(HTTP_HEADER_X_XPLORA_USER_RID) || '',
        newAuthToken: rawJwtHeaderValue,
      };
    },
  };

  return {
    gqlServer,
    gqlGateway,
    middlewareOptions,
  };
}

module.exports = { makeGraphqlServer };
