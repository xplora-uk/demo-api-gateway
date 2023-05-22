const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const { buildSubgraphSchema } = require('@apollo/subgraph');
const { readFileSync } = require('fs');
const { gql } = require('graphql-tag');
const { resolve } = require('path');
const data = require('./data');

const gqlText = readFileSync(resolve(__dirname, 'schema.graphql'), 'utf8').toString('utf-8');
const typeDefs = gql`${gqlText}`;

const resolvers = {
  Query: {
    campaigns: () => data.campaigns,
  },

  // extend User model of other subgraph
  User: {
    campaigns: () => data.campaigns,
  },
};

main();

async function main() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  });
  const { url } = await startStandaloneServer(server, { listen: { port: 15001 } });
  console.log(`🚀 Campaigns GraphQL server is listening at: ${url}`);
}
