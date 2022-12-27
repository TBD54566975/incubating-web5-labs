import { Dwn } from '@tbd54566975/dwn-sdk-js';

let dwn;

export async function open() {
  if (!dwn) {
    dwn = await Dwn.create({});
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
    const response = await fetch(host, {
      method : 'POST',
      body   : JSON.stringify(message)
    });

    // TODO: handle non-200 responses
    return response.json();
  } catch (error) {
    console.log(error);
  }


}