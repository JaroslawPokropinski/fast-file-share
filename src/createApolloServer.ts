import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { GraphQLSchema } from 'graphql';
import { Service } from 'typedi';

const PORT = 4022;

@Service()
export class GraphqlServer {
  constructor() {}

  async start(schema: GraphQLSchema) {
    // Create an Express app and HTTP server; we will attach both the WebSocket
    // server and the ApolloServer to this HTTP server.
    const app = express();
    const httpServer = createServer(app);

    // Create our WebSocket server using the HTTP server we just set up.
    const wsServer = new WebSocketServer({
      server: httpServer,
      path: '/subscriptions',
    });
    // Save the returned server's info so we can shutdown this server later
    const serverCleanup = useServer({ schema }, wsServer);

    // Set up ApolloServer.
    const server = new ApolloServer({
      schema,
      plugins: [
        // Proper shutdown for the HTTP server.
        ApolloServerPluginDrainHttpServer({ httpServer }),

        // Proper shutdown for the WebSocket server.
        {
          async serverWillStart() {
            return {
              async drainServer() {
                await serverCleanup.dispose();
              },
            };
          },
        },
      ],
    });

    await server.start();
    app.use(
      '/graphql',
      cors<cors.CorsRequest>(),
      bodyParser.json(),
      expressMiddleware(server, {
        context: async () => ({ loggedInUser: 'user' }),
      })
    );

    // Now that our HTTP server is fully set up, we can listen to it.
    httpServer.listen(PORT, () => {
      console.log(`Server is now running on http://localhost:${PORT}/graphql`);
    });
  }
}
