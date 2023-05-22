# api-gateway

API gateway to handle common operations and take over external traffic from main API [gw-core](https://github.com/XploraTechnologiesAS/xplora-o2o-apiv2/tree/master/core).

We will use [Apollo Gateway](https://www.apollographql.com/docs/apollo-server/using-federation/apollo-gateway-setup) to serve our [Apollo GraphQL Federation](https://www.apollographql.com/docs/federation/) and [HTTP Proxy middleware](https://www.npmjs.com/package/http-proxy-middleware).

## requirements

* Node v16.x
  * NVM is recommended

## installation

```sh
npm i
```

## configuration

Copy the sample environment settings file and edit it.

```sh
cp .env-sample.env .env
```

Sample settings:

```plain
HTTP_PORT="15000"

SUBGRAPH_COUNT="2"

SUBGRAPH_1_NAME="campaigns"
SUBGRAPH_1_URL="http://localhost:15001/graphql"

SUBGRAPH_2_NAME="users"
SUBGRAPH_2_URL="http://localhost:15002/graphql"
```

## linting

TODO

## testing

TODO

## execution

GraphQL federation servers (subgraph servers) must be started before this Gateway. See [demo-gql-campaigns](./demo-gql-campaigns) and [demo-gql-users](./demo-gql-users/).

```sh
# terminal 1: a server of federation
cd demo-gql-campaigns && npm run start

# terminal 2: a server of federation
cd demo-gql-users && npm run start

# terminal 3: gateway to federation
npm run start
```

Sample GraphQL command:

```graphql
query {
  campaigns { # to be resolved by demo-gql-campaigns
    id
    title
    owner { # to resolved by demo-gql-users
      id
      username
    }
  }
  me { # to resolved by demo-gql-users
    id
    username
    campaigns { # to be resolved by demo-gql-campaigns
      id
      title
    }
  }
}
```
