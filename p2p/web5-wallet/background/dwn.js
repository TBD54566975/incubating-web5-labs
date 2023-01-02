import { Dwn } from '@tbd54566975/dwn-sdk-js';
import { MessageStore } from 'message-store-level-v2';

let dwn;
export const messageStore = new MessageStore();

export async function open() {
  if (!dwn) {
    dwn = await Dwn.create({ messageStore });
  }

  return dwn;
}

/**
 * Sends provided message to provided host
 * @param {string} host 
 * @param {object} message 
 */
export async function send(host, message) {
  // TODO: handle request failure
  console.log('sending to', host);
  try {
    // TODO: remove /dwn
    const response = await fetch(`${host}/dwn`, {
      method : 'POST',
      body   : JSON.stringify(message)
    });

    // TODO: handle non-200 responses
    return response.json();
  } catch (error) {
    console.log(error);
  }
}