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
    me: () => data.users[0],
  },

  // extend Campaign model of other subgraph
  Campaign: {
    owner: () => data.users[0],
  },
};

main();

async function main() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  });
  const { url } = await startStandaloneServer(server, { listen: { port: 15002 } });
  console.log(`🚀 Users GraphQL server is listening at: ${url}`);
}
