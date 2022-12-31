import { match } from 'path-to-regexp';

export class RequestRouter {
  #routes;

  constructor() {
    this.#routes = {
      delete : [],
      get    : [],
      post   : [],
      put    : []
    };
    
    chrome.runtime.onMessage.addListener(async (message, sender) => {
      const { endpoint, method } = message;

      if (!endpoint || !method) {
        return;
      }

      const routes = this.#routes[message.method];
      let matchedRoute;

      for (let route of routes) {
        if (route.matches(endpoint)) {
          matchedRoute = route;
          break;
        }
      }

      if (!matchedRoute) {
        return chrome.tabs.sendMessage(sender.tab.id, {
          id     : message.id,
          status : 404
        });
      }

      try {
        const result = await matchedRoute.handler({
          endpoint,
          params : matchedRoute.params,
          data   : message.data
        });

        return chrome.tabs.sendMessage(sender.tab.id, {
          id   : message.id,
          data : result
        });
      } catch(e) {
        console.error(e);
        return chrome.tabs.sendMessage(sender.tab.id, {
          id     : message.id,
          status : 500
        });
      }
    });
  }

  delete(route, handler) {
    this.#addRoute('delete', route, handler);
  }

  get(route, handler) {
    this.#addRoute('get', route, handler);
  }

  post(route, handler) {
    this.#addRoute('post', route, handler);
  }

  put(route, handler) {
    this.#addRoute('put', route, handler);
  }

  #addRoute(method, route, handler) {
    const matches = match(route);
    
    this.#routes[method].push({
      handler,
      matches,
      method,
      route,
    });
  }
}