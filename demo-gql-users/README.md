# demo-gql-users

GraphQL federation server for:

```graphql
type Query {
  me: User!
}

type User @key(fields: "id") {
  id: ID!
  username: String!
}

extend type Campaign @key(fields: "id") {
  id: ID! @external
  owner: User!
}
```
