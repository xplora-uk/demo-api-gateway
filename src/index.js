const { makeFactory } = require('./factory');
const { readSecrets } = require('./secrets');

main();

async function main() {

  readSecrets();

  const f = await makeFactory();

  f.httpServer.listen({ port: f.config.http.port }, () => {
    f.logger.log(`api-gateway ready at http://localhost:${f.config.http.port}`);
  });
}
