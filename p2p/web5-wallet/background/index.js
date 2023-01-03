import * as DWN from './dwn';

import { IdentityStore } from './db';

import { AlarmRouter } from './lib/alarm-router';
import { MessageRouter } from './lib/message-router';
import { RequestRouter } from './lib/request-router';

import { pushDwnMessages } from './alarm-handlers/push-dwn-messages';
import { pullDwnMessages } from './alarm-handlers/pull-dwn-messages';

import { requestAccess } from './message-handlers/dwn/request-access';
import { processMessage } from './message-handlers/dwn/process-message';

import { getIdentities } from './request-handlers/get-identities';
import { createIdentity } from './request-handlers/create-identity';

chrome.runtime.onInstalled.addListener(async ({ _reason, _version }) => {
  console.log('extension installed');
  const defaultIdentity = await IdentityStore.getByName('default');

  if (!defaultIdentity) {
    console.log('creating default DID');
    await IdentityStore.create('default', 'key');
  }

  await DWN.open();

  chrome.alarms.create('dwn.push', { delayInMinutes: 1 });
  chrome.alarms.create('dwn.pull', { delayInMinutes: 1 });
});

// controls what happens when the extension's icon is clicked
chrome.action.onClicked.addListener(async _ => {
  // load the extension dashboard in a new tab in the current window
  await chrome.tabs.create({ active: true, url: '/index.html' });
});

const alarmRouter = new AlarmRouter();
alarmRouter.on('dwn.push', pushDwnMessages);
alarmRouter.on('dwn.pull', pullDwnMessages);

const requestRouter = new RequestRouter();
requestRouter.get('/identities', getIdentities);
requestRouter.post('/identities', createIdentity);

const messageRouter = new MessageRouter();
messageRouter.on('web5.dwn.requestAccess', requestAccess);
messageRouter.on('web5.dwn.processMessage', processMessage);

// TODO: implement subscribe
// messageRouter.on('web5.dwn.subscribe', subscribe);