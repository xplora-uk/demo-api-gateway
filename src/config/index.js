function makeConfig(penv) {

  let httpPort = Number.parseInt(penv.HTTP_PORT || '15000');
  if (Number.isNaN(httpPort) || httpPort < 0 || httpPort > 65535) httpPort = 15000;

  const federation = [];

  const subgraphCount = Number.parseInt(penv.SUBGRAPH_COUNT || '0');
  if (Number.isNaN(subgraphCount) || subgraphCount < 0) throw new Error('SUBGRAPH_COUNT must be a positive integer');

  for (let i = 1; i <= subgraphCount; i++) {
    const name = penv[`SUBGRAPH_${i}_NAME`] || '';
    const url = penv[`SUBGRAPH_${i}_URL`] || '';
    if (!name || !url) throw new Error(`SUBGRAPH_${i}_NAME and SUBGRAPH_${i}_URL must be set`);
    federation.push({ name, url });
  }

  return {
    http: {
      port: httpPort,
    },
    graphql: {
      federation,
    },
  };
}

module.exports = { makeConfig };
