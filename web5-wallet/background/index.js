import * as DWN from './dwn';

import { createIndexes, ProfileStore } from './db';

import { AlarmRouter } from './lib/alarm-router';
import { MessageRouter } from './lib/message-router';
import { RequestRouter } from './lib/request-router';

import { pushDwnMessages } from './alarm-handlers/push-dwn-messages';
import { pullDwnMessages } from './alarm-handlers/pull-dwn-messages';

import { requestAccess } from './web5-message-handlers/dwn/request-access';
import { processMessage } from './web5-message-handlers/dwn/process-message';

import { getProfiles } from './ui-request-handlers/get-profiles';
import { createProfile } from './ui-request-handlers/create-profile';

chrome.runtime.onInstalled.addListener(async ({ _reason, _version }) => {
  console.log('extension installed');
  await createIndexes(); 

  const defaultProfile = await ProfileStore.getByName('default');

  if (!defaultProfile) {
    console.log('creating default DID');
    await ProfileStore.create('default', 'key');
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

// registers handlers for all [chrome.alarms](https://developer.chrome.com/docs/extensions/reference/alarms/)
const alarmRouter = new AlarmRouter();
alarmRouter.on('dwn.push', pushDwnMessages);
alarmRouter.on('dwn.pull', pullDwnMessages);

// registers handlers for all requests made by UI
const uiRequestRouter = new RequestRouter();
uiRequestRouter.get('/profiles', getProfiles);
uiRequestRouter.post('/profiles', createProfile);

// registers handlers for all inbound web5 messages
const web5MessageRouter = new MessageRouter();
web5MessageRouter.on('web5.dwn.requestAccess', requestAccess);
web5MessageRouter.on('web5.dwn.processMessage', processMessage);

// TODO: implement subscribe
// messageRouter.on('web5.dwn.subscribe', subscribe);