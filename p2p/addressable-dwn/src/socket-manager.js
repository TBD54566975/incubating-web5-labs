class _WebSocketManager {
  #sockets;
  constructor() {
    this.#sockets = {};

  }

  addWebSocket(label, socket) {
    this.#sockets[label] = socket;
  }

  getWebSocket(label) {
    this.#sockets[label];
  }
}

export const WebSocketManager = new _WebSocketManager();