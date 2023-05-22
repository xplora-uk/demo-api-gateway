const { makeFactory } = require('./factory');

main();

async function main() {
  const f = await makeFactory();

  f.httpServer.listen({ port: f.config.http.port }, () => {
    console.log('GraphQL Federation', f.config.graphql.federation);
    console.log(`🚀 GraphQL Gateway is ready at http://localhost:${f.config.http.port}`);
  });
}
