import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client';

import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const GRAPHQL_BASE_URL = 'vite.merume.ovh';
const GRAPHQL_PORT = '4022';
const SECURE_PROT = true;
// const GRAPHQL_URL = `${GRAPHQL_BASE_URL}:${GRAPHQL_PORT}`;
const GRAPHQL_URL = `vite.merume.ovh`;

const wsLink = new GraphQLWsLink(
  createClient({
    url: `${SECURE_PROT ? 'wss' : 'ws'}://${GRAPHQL_URL}/subscriptions`,
  }),
);

export const httpLink = new HttpLink({
  uri: `${SECURE_PROT ? 'https' : 'http'}://${GRAPHQL_URL}/graphql`,
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
