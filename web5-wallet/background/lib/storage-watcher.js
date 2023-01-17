class StorageWatcher {
  constructor() {
    this.listeners = {
      local   : {},
      session : {},
      sync    : {}
    };

    chrome.storage.onChanged.addListener(async (changes, namespace) => {
      const namespaceListeners = this.listeners[namespace];

      for (let key in namespaceListeners) {
        if (changes[key]) {
          const { fn, once } = namespaceListeners[key];
          const { oldValue, newValue } = changes[key];

          await fn(oldValue, newValue);

          if (once) {
            delete namespaceListeners[key];
          }
        }
      }
    });
  }

  once(namespace, key, fn) {
    this.listeners[namespace][key] = { fn, once: true };
  }
}

export const storageWatcher = new StorageWatcher();