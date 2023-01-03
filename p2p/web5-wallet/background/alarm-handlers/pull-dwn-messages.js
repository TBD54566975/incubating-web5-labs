import * as DWN from '../dwn';
import { IdentityStore, WatermarkStore } from '../db';
import { DIDResolver } from '../lib/did-resolver';
import { CID } from 'multiformats/cid';

// did methods that support the `service` property.
// TODO: think about better way to do this
const compatibleDidMethods = new Set(['ion']);

export async function pullDwnMessages() {
  const identities = await IdentityStore.getAllIdentities();
  const dwn = await DWN.open();

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

    let watermarkKey; 
    const watermark = await WatermarkStore.getWatermark(identity._id, 'pull');
    
    if (watermark) {
      watermarkKey = watermark.key;
      console.log('[pull] watermark found', watermarkKey);
    }


    const eventLog = await DWN.getEventLog(dwnHost, identity.did, watermarkKey);
    console.log(`[pull] pulling dwn messages from ${dwnHost} for ${identity.name}. ${eventLog.length} messages to pull`, eventLog);
    let numAccepts = 0;
    let numDupes = 0;

    for (let event of eventLog) {
      const cid = CID.parse(event.messageCid);
      const messageExists = await DWN.messageStore.has(cid);
      
      if (messageExists) {
        numDupes += 1;
      } else {
        const message = await DWN.getMessage(dwnHost, identity.did, event.messageCid);
        const result = await dwn.processMessage(message);
        numAccepts += 1;
        console.log(`[pull] synced message ${event.messageCid}. result`, result);
      }
      
      console.log(`[pull] # accepts: ${numAccepts}. # dupes: ${numDupes}`);
      await WatermarkStore.upsert(identity._id, 'pull', event.watermark);
    }


  }

  chrome.alarms.create('dwn.pull', { delayInMinutes: 1 });
}