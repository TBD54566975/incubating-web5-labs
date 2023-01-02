import * as DWN from '../dwn';
import { IdentityStore, WatermarkStore } from '../db';
import { DIDResolver } from '../lib/did-resolver';
import { CID } from 'multiformats/cid';

// did methods that support the `service` property.
// TODO: think about better way to do this
const compatibleDidMethods = new Set(['ion']);

export async function pushDwnMessages() {
  const identities = await IdentityStore.getAllIdentities();

  for (let identity of identities) {
    if (!compatibleDidMethods.has(identity.didMethod)) {
      continue;
    }

    const dwnHosts = await DIDResolver.getDWNHosts(identity.did);

    // TODO: handle multiple dwn hosts. send to all? send to at least 1 successfully?
    const [ dwnHost ] = dwnHosts;

    if (!dwnHost) {
      continue;
    }

    console.log('dwn host', dwnHost);

    console.log(`pushing dwn messages for ${identity.did}`);

    let watermarkKey; 
    const watermark = await WatermarkStore.getWatermark('push', identity._id);
    
    if (watermark) {
      watermarkKey = watermark.key;
    }

    console.log('watermark', watermark);

    const tenantEvents = await DWN.messageStore.getEventLog(identity.did, watermarkKey);
    console.log('tenantEvents', tenantEvents);
    
    for (let event of tenantEvents) {
      const messageCid = CID.parse(event.messageCid);
      const message = await DWN.messageStore.get(messageCid);

      const sendResult = await DWN.send(dwnHost, message);
      console.log('push result', sendResult);

      // TODO: on success update watermark
      await WatermarkStore.upsert('push', identity._id, event.watermark);

      // TODO: send message to recipient
    }

    chrome.alarms.create('dwn.push', { delayInMinutes: 1 });
  }
}