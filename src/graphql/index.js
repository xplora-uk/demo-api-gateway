const { ApolloGateway, IntrospectAndCompose, RemoteGraphQLDataSource } = require('@apollo/gateway');
const { ApolloServer } = require('@apollo/server');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { HTTP_HEADER_H_BACKDOOR_AUTHORIZATION, HTTP_HEADER_AUTHORIZATION, HTTP_HEADER_X_XPLORA_USER_RID, HTTP_HEADER_H_DATE, HTTP_HEADER_H_TRANSACTION_ID } = require('../constants');

async function makeGraphqlServer(config, httpServer) {

  class AuthenticatedDataSource extends RemoteGraphQLDataSource {
    willSendRequest({ request, context }) {
      // Outgoing request to the component of the Federation e.g. gw-core
      // For security reasons we want to keep the existing logic and precautions as they are
      console.log('passing to gw-core', { context });
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
      console.log('new request headers', req.headers);

      return {
        authToken: req.get(HTTP_HEADER_H_BACKDOOR_AUTHORIZATION) || '',
        txnId: req.get(HTTP_HEADER_H_TRANSACTION_ID) || '',
        newAuthToken: req.get(HTTP_HEADER_AUTHORIZATION) || '',
        userRid: req.get(HTTP_HEADER_X_XPLORA_USER_RID) || '',
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
