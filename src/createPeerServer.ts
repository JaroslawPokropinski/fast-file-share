import { Server } from 'bittorrent-tracker';
import { Service } from 'typedi';
import { PeerServer as PeerJsServer } from "peer";

const PEER_SERVER_PORT = 4023;

@Service()
export class PeerServer {
  instance: any;

  constructor() {
    this.instance = new Server({
      udp: false,
      http: false,
      ws: true,
      trustProxy: false,
    });

    this.instance.listen(PEER_SERVER_PORT, () => {
      console.log(
        `Peer server is now running on ws://localhost:${PEER_SERVER_PORT}`
      );
    });

    // this.instance = PeerJsServer({ port: PEER_SERVER_PORT, path: "/myapp" });
  }
}
