import EventEmitter from 'eventemitter3';

/**
 * used by content scripts to send messages to the extension's background service
 * worker and receive responses in a synchronous manner. 
 */
export class Messenger {
  constructor() {
    this.emitter = new EventEmitter();
    chrome.runtime.onMessage.addListener(message => {
      this.emitter.emit(message.id, message);
    });
  }

  sendMessage(message) {
    return new Promise((resolve, reject) => {
      if (!message.id) {
        message.id = Date.now();
      }

      this.emitter.once(message.id, resolve);
      chrome.runtime.sendMessage(message);
    });
  }
}