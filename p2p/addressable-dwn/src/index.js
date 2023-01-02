import { parse } from 'url';
import { WebSocketServer } from 'ws';

import app from './app.js';
import { Encoder } from './encoder.js';
import { messageStore } from './dwn.js';
import { WebSocketManager } from './socket-manager.js';

/**
 * @typedef {import('ws').WebSocket} WebSocket
 */

const wsServer = new WebSocketServer({ noServer: true });

wsServer.on('connection', function connection(socket, request, client) {
  console.log('connect emitted');

  socket.isAlive = true;
  socket.target = client;

  // Pong messages are automatically sent in response to ping messages as required by 
  // the websocket spec. So, no need to send explicit pongs from browser
  socket.on('pong', function heartbeat() {
    this.isAlive = true;
  });

  WebSocketManager.addWebSocket(client, socket);

  socket.on('message', async function handleMessage(dataBytes) {
    console.log(`Received message ${data} from user ${client}`);

    // TODO: add error handling. this can easily bork
    const dataString = new TextDecoder().decode(dataBytes);
    const data = JSON.parse(dataString);

    if (data.cmd === 'GET_EVENT_LOG') {
      const eventLog = await messageStore.getEventLog(data.watermark);
      const resp = {
        cmd: 'EVENT_LOG',
        data: eventLog
      }

      const respBytes = Encoder.objectToBytes(resp);

      return this.send(respBytes);
    } else if (data.cmd === 'GET_MESSAGE') {
      // TODO: add error handling
      const message = await messageStore.get(data.cid);
      const messageBytes = Encoder.objectToBytes(message);

      return this.send(messageBytes);
    }
  });
});

// messageStore.on('put', async event => {
//   /** @type {WebSocket} */
//   const socket = WebSocketManager.getWebSocket(event.target);

//   if (!socket) {
//     return;
//   }

//   const eventString = JSON.stringify(event);
//   const eventBytes = new TextEncoder.encode(eventString);

//   return socket.send(eventBytes);
// });

const heartbeatInterval = setInterval(function ping() {
  wsServer.clients.forEach(function pingSocket(socket) {
    if (socket.isAlive === false) {
      return socket.terminate();
    }

    socket.isAlive = false;
    socket.ping();
  })
}, 30_000);

wsServer.on('close', function close() {
  clearInterval(heartbeatInterval);
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

  // auth is just a DID right now
  const { authorization } = query;

  try {

    // const did = await didAuthn(request);
    // TODO: check if DID is tenant. if yes, upgrade. if no, destroy socket
    // TODO: cache socket in map

    wsServer.handleUpgrade(request, socket, head, socket => {
      console.log('done handling upgrade');
      wsServer.emit('connection', socket, request, authorization);
    });
  } catch (e) {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }
});

async function didAuthn(request) {
  // TODO: verify JWS
  // TODO: return DID if is tenant. throw exception otherwise
}