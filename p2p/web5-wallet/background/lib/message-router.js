export class MessageRouter {
  #messageHandlers;
  
  constructor() {
    this.#messageHandlers = {};

    chrome.runtime.onMessage.addListener(async (message, sender) => {
      if (!message.cmd) {
        return;
      }
      const { id, cmd, data } = message;
      const handler = this.#messageHandlers[cmd];

      if (!handler) {
        return chrome.tabs.sendMessage(sender.tab.id, { id, error: 'Unsupported message type.' });
      }

      const ctx = {
        message: { cmd, id },
        sender
      };

      try {
        const response = await handler(ctx, data);

        return chrome.tabs.sendMessage(sender.tab.id, { id, data: response });
      } catch(e) {
        console.error(e);
        // TODO: improve error handling. potentially allow for multiple errors to be surfaced
        return chrome.tabs.sendMessage(sender.tab.id, {id, error: 'internal error.'});
      }
    });
  }

  on(cmd, handler) {
    this.#messageHandlers[cmd] = handler;
  }
}