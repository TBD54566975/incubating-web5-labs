import { CollectionsQuery, CollectionsWrite } from '@tbd54566975/dwn-sdk-js';

import * as db from './db';
import * as DWN from './dwn';

import { openUserConsentWindow } from './utils';

chrome.runtime.onInstalled.addListener(async ({ _reason, _version }) => {
  console.log('extension installed');
  const { Identity } = await db.open();
  const [defaultIdentity] = await Identity.query({ name: 'default' }, { limit: 1 });

  if (!defaultIdentity) {
    console.log('creating default DID');
    await Identity.create('default');
  }

  await DWN.open();
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
        id   : message.id,
        data : {
          isAllowed: permissions.isAllowed
        }
      });
    } else {
      // show user consent prompt if no permissions exist for domain yet
      const isAllowed = await openUserConsentWindow('user-consent/dwn-access', { requestingDomain: sender.origin });
      const { did } = await Identity.getByName('default');

      await AccessControl.createPermission(sender.origin, did, isAllowed);

      await chrome.tabs.sendMessage(sender.tab.id, {
        id   : message.id,
        data : { isAllowed }
      });
    }
  } else if (message.cmd === 'DWN_PROCESS_MESSAGE') {
    const { AccessControl, Identity } = await db.open();

    const permissions = await AccessControl.getDomainPermissions(sender.origin);

    if (!permissions.isAllowed) {
      await chrome.tabs.sendMessage(sender.tab.id, {
        id    : message.id,
        error : 'ACCESS_FORBIDDEN'
      });

      return;
    }

    const dwn = await DWN.open();

    const { data } = message;
    const identity = await Identity.getByDID(permissions.did);
    const signatureMaterial = Identity.getDWNSignatureMaterial(identity);

    if (data.method === 'CollectionsQuery') {

      const collectionsQuery = await CollectionsQuery.create({
        ...data.message,
        target         : identity.did,
        signatureInput : signatureMaterial
      });

      const result = await dwn.processMessage(collectionsQuery.toJSON());

      await chrome.tabs.sendMessage(sender.tab.id, {
        id   : message.id,
        data : result
      });
    } else if (data.method === 'CollectionsWrite') {
      // TODO: ew. `data.data` need to think of less confusing property names
      if (data.data) {
        const { dataFormat } = data.message;

        // handle data encoding
        if (dataFormat) {
          if (dataFormat === 'application/json') {
            const jsonStringified = JSON.stringify(data.data);
            const jsonBytes = new TextEncoder().encode(jsonStringified);

            data.message.data = jsonBytes;
          }
        }
      }

      const collectionsWrite = await CollectionsWrite.create({
        ...data.message,
        target         : identity.did,
        signatureInput : signatureMaterial
      });

      const result = await dwn.processMessage(collectionsWrite.toJSON());

      await chrome.tabs.sendMessage(sender.tab.id, {
        id   : message.id,
        data : {
          record: collectionsWrite.toJSON(),
          result
        }
      });
    }
  }
});


// await window.web5.dwn.processMessage({
//   method: 'CollectionsQuery',
//   message: {
//     filter: {
//       schema: 'http://some-schema-registry.org/todo'
//     }
//   }
// });