# demo-gql-campaigns

GraphQL federation server for:

```graphql
type Query {
  campaigns: [Campaign!]!
}

type Campaign @key(fields: "id") {
  id: ID!
  title: String!
}

extend type User @key(fields: "id") {
  id: ID! @external
  campaigns: [Campaign!]!
}
```
