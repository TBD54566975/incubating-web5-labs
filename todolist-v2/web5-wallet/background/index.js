import { v4 as uuidv4 } from 'uuid';
import * as db from './db';
import { openUserConsentWindow } from './utils';

chrome.runtime.onInstalled.addListener(async ({ _reason, _version }) => {
  console.log('extension installed');
  const { Identity } = await db.open()
  const [defaultIdentity] = await Identity.query({ name: 'default' }, { limit: 1 });

  if (!defaultIdentity) {
    console.log('creating default DID');
    await Identity.create('default');
  }


});

// controls what happens when the extension's icon is clicked
chrome.action.onClicked.addListener(async _ => {
  // load the extension dashboard in a new tab in the current window
  await chrome.tabs.create({ active: true, url: '/index.html' });
});

chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.cmd === 'DWN_REQUEST_ACCESS') {
    const { AccessControl, Identity } = await db.open();

    const permissions = await AccessControl.getDomainPermissions(sender.origin);

    if (permissions) {
      await chrome.tabs.sendMessage(sender.tab.id, {
        id: message.id,
        data: {
          isAllowed: permissions.isAllowed
        }
      });
    } else {
      // show user consent prompt if no permissions exist for domain yet
      const isAllowed = await openUserConsentWindow('user-consent/dwn-access', { requestingDomain: sender.origin });
      const { did } = await Identity.getByName('default');

      await AccessControl.createPermission(sender.origin, did, isAllowed);

      await chrome.tabs.sendMessage(sender.tab.id, { id: message.id, data: { isAllowed } });
    }
  }

});