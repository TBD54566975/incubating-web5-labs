import * as DWN from './dwn';

import { IdentityStore } from './db';
import { MessageRouter } from './lib/message-router';
import { RequestRouter } from './lib/request-router';

import { requestAccess } from './message-handlers/dwn/request-access';
import { processMessage } from './message-handlers/dwn/process-message';

import { getIdentities } from './request-handlers/get-identities';
import { createIdentity } from './request-handlers/create-identity';


// const WebSocket = globalThis.WebSocket;

chrome.runtime.onInstalled.addListener(async ({ _reason, _version }) => {
  console.log('extension installed');
  const defaultIdentity = await IdentityStore.getByName('default');

  if (!defaultIdentity) {
    console.log('creating default DID');
    await IdentityStore.create('default', 'key');
  }

  await DWN.open();

  // const connection = new WebSocket('ws://localhost:3000/sync');

  // connection.onopen = function() {
  //   console.log('connection opened');
  // };

  // connection.onerror = function(error) {
  //   console.log('connection errored', error);
  // };

  // connection.onmessage = function(e) {
  //   console.log('message recvd', e);
  // };

  // connection.onclose = function(event) {
  //   console.log('connection closed', event);
  // };
});

// controls what happens when the extension's icon is clicked
chrome.action.onClicked.addListener(async _ => {
  // load the extension dashboard in a new tab in the current window
  await chrome.tabs.create({ active: true, url: '/index.html' });
});

const requestRouter = new RequestRouter();
requestRouter.get('/identities', getIdentities);
requestRouter.post('/identities', createIdentity);

const messageRouter = new MessageRouter();
messageRouter.on('web5.dwn.requestAccess', requestAccess);
messageRouter.on('web5.dwn.processMessage', processMessage);