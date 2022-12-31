import EventEmitter from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';

/**
 * Sends requests to Background Service Worker
 */
class _BackgroundRequest {
  #emitter;

  constructor() {
    this.#emitter = new EventEmitter();
    chrome.runtime.onMessage.addListener(message => {
      this.#emitter.emit(message.id, message);
    });
  }

  delete(endpoint) {
    return this.#sendRequest('delete', endpoint);
  }

  get(endpoint) {
    return this.#sendRequest('get', endpoint);
  }

  post(endpoint, data) {
    return this.#sendRequest('post', endpoint, data);
  }

  put(endpoint, data) {
    return this.#sendRequest('put', endpoint, data);
  }

  #sendRequest(method, endpoint, data) {
    return new Promise((resolve, reject) => {
      const message = { id: uuidv4(), method, endpoint, data};

      this.#emitter.once(message.id, resolve);
      chrome.runtime.sendMessage(message);
    });
  }
}

export const BackgroundRequest = new _BackgroundRequest();