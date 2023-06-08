const Axios = require("axios");
const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { buildSubgraphSchema } = require("@apollo/subgraph");
const { readFileSync } = require("fs");
const { gql } = require("graphql-tag");
const { resolve } = require("path");
const data = require("./data");

const gqlText = readFileSync(
  resolve(__dirname, "schema.graphql"),
  "utf8"
).toString("utf-8");
const typeDefs = gql`
  ${gqlText}
`;

const resolvers = {
  Query: {
    me: () => ({ ...data.users[0], __typename: "User" }),
  },

  // extend Campaign model of other subgraph
  Campaign: {
    owner: () => data.users[0],
  },

  User: {
    lastLocation: () => ({ lat: "40.991", lng: "29.021" }),
  },

  Location: {
    city: async () => {
      const { data } = await Axios.get(
        "http://localhost:5000/v1/weather/cities"
      );
      return data.data[0];
    },
  },

  City: {
    id: (parent) => parent.city_id,
    name: (parent) => parent.city_name,
  },
};

main();

async function main() {
  const server = new ApolloServer({
    schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  });
  const { url } = await startStandaloneServer(server, {
    listen: { port: 15002 },
  });
  console.log(`🚀 Users GraphQL server is listening at: ${url}`);
}
