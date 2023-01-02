import { match } from 'path-to-regexp';

/**
 * @typedef {object} Request
 * @property {string} endpoint
 * @property {object} [params] - query params
 * @property {object} [data] - request body
 */

/**
 * @typedef {object} Response
 * @property {number} [status=200] - response status
 * @property {any} [data] - response data returned to the requester
 */

/**
 * @callback Handler
 * @param {Request} request
 * @returns {Promise<Response>}
 */

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

      const routes = this.#routes[method];
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
          id     : message.id,
          status : result.status || 200,
          data   : result.data
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

  /**
   * registers a handler at the route provided
   * @param {string} route 
   * @param {Handler} handler 
   */
  delete(route, handler) {
    this.#addRoute('delete', route, handler);
  }

  /**
   * registers a handler at the route provided
   * @param {string} route 
   * @param {Handler} handler 
   */
  get(route, handler) {
    this.#addRoute('get', route, handler);
  }

  /**
   * registers a handler at the route provided
   * @param {string} route 
   * @param {Handler} handler 
   */
  post(route, handler) {
    this.#addRoute('post', route, handler);
  }

  /**
   * registers a handler at the route provided
   * @param {string} route 
   * @param {Handler} handler 
   */
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