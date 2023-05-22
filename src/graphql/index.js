const { ApolloGateway, IntrospectAndCompose } = require('@apollo/gateway');
const { ApolloServer } = require('@apollo/server');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');

async function makeGraphqlServer(config, httpServer) {

  const gqlGateway = new ApolloGateway({
    supergraphSdl: new IntrospectAndCompose({
      subgraphs: config.graphql.federation,
    }),
  });

  const gqlServer = new ApolloServer({
    gateway: gqlGateway,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
    ],
  });

  // for express middleware
  const middlewareOptions = {
    context: async ({ req }) => ({ token: req.headers.token }),
  };

  return {
    gqlServer,
    gqlGateway,
    middlewareOptions,
  };
}

module.exports = { makeGraphqlServer };
