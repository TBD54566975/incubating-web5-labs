import { parse } from 'url';
import { WebSocketServer } from 'ws';
import app from './app.js';

const wsServer = new WebSocketServer({ noServer: true });

wsServer.on('connection', (socket, request, client) => {
  console.log('connect emitted');
  socket.on('message', data => {
    console.log(`Received message ${data} from user ${client}`);
  });
});

const httpServer = app.listen(3000, () => {
  console.log('server listening on port 3000');
});

httpServer.on('upgrade', async (request, socket, head) => {
  const { pathname, query } = parse(request.url);

  if (pathname !== '/sync') {
    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    socket.destroy();
    return;
  }

  try {

    // const did = await didAuthn(request);
    // TODO: check if DID is tenant. if yes, upgrade. if no, destroy socket
    // TODO: cache socket in map

    wsServer.handleUpgrade(request, socket, head, socket => {
      console.log('done handling upgrade');
      wsServer.emit('connection', socket, request, 'did:ion:123');
    });
  } catch (e) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }
});

async function didAuthn(request) {
  // TODO: request.headers['Authorization'] should be a JWS
  // TODO: verify JWS
  // TODO: return DID if is tenant. throw exception otherwise
}