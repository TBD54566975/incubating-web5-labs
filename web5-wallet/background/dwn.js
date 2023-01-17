import { Dwn } from '@tbd54566975/dwn-sdk-js';
import { MessageStore } from 'message-store-level-v2';
import { CID } from 'multiformats/cid';

let dwn;
export const messageStore = new MessageStore();

/**
 * 
 * @returns {Promise<Dwn>}
 */
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
  console.log('sending dwn message to', host);
  // TODO: remove /dwn
  const response = await fetch(`${host}/dwn`, {
    method : 'POST',
    body   : JSON.stringify(message)
  });

  // TODO: handle non-200 responses
  return response.json();
}

export async function getEventLog(host, tenant, watermark) {
  // TODO: handle request failure
  console.log('getting event log from', host);
  // TODO: remove /dwn/event-log
  const response = await fetch(`${host}/dwn/event-log`, {
    method  : 'POST',
    headers : {
      authorization: tenant
    },
    body: JSON.stringify({ watermark })
  });

  // TODO: handle non-200 responses
  const { data } = await response.json();

  return data;
}

export async function getMessage(host, tenant, cid) {
  console.log(`getting message ${cid} from`, host);
  
  const url = `${host}/dwn/messages/${cid}`;
  const response = await fetch(url, {
    method  : 'GET',
    headers : {
      authorization: tenant
    }
  });

  console.log(`${url} response:`, response.status);

  // TODO: handle non-200 responses
  const { data } = await response.json();

  return data;
}