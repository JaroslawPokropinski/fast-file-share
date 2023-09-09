import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { NotificationResolver } from './schema/notification-resolver.js';
import { Container } from 'typedi';
import { PeerServer } from './createPeerServer.js';
import { GraphqlServer } from './createApolloServer.js';

async function main() {
  const schema = await buildSchema({
    resolvers: [NotificationResolver],
    container: Container,
  });

  // register typedi services
  Container.get(GraphqlServer).start(schema).catch(console.error);
  Container.get(PeerServer);
}

main().then(console.error);
