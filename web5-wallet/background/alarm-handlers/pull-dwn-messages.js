import * as DWN from '../dwn';
import { ProfileStore, WatermarkStore } from '../db';
import { DIDResolver } from '../lib/did-resolver';
import { CID } from 'multiformats/cid';

// did methods that support the `service` property.
// TODO: think about better way to do this
const compatibleDidMethods = new Set(['ion']);

export async function pullDwnMessages() {
  const profiles = await ProfileStore.getAllProfiles();
  const dwn = await DWN.open();

  for (let profile of profiles) {
    if (!compatibleDidMethods.has(profile.didMethod)) {
      continue;
    }

    const dwnHosts = await DIDResolver.getDWNHosts(profile.did);

    // TODO: handle multiple dwn hosts. send to all? send to at least 1 successfully?
    const [ dwnHost ] = dwnHosts;

    if (!dwnHost) {
      continue;
    }

    let watermarkKey; 
    const watermark = await WatermarkStore.getWatermark(profile._id, 'pull');
    
    if (watermark) {
      watermarkKey = watermark.key;
      console.log('[pull] watermark found', watermarkKey);
    }


    const eventLog = await DWN.getEventLog(dwnHost, profile.did, watermarkKey);
    console.log(`[pull] pulling dwn messages from ${dwnHost} for ${profile.name}. ${eventLog.length} messages to pull`, eventLog);
    let numAccepts = 0;
    let numDupes = 0;

    for (let event of eventLog) {
      const cid = CID.parse(event.messageCid);
      const messageExists = await DWN.messageStore.has(cid);
      
      if (messageExists) {
        numDupes += 1;
      } else {
        const message = await DWN.getMessage(dwnHost, profile.did, event.messageCid);
        const result = await dwn.processMessage(message);
        numAccepts += 1;
        console.log(`[pull] synced message ${event.messageCid}. result`, result);
      }
      
      console.log(`[pull] # accepts: ${numAccepts}. # dupes: ${numDupes}`);
      await WatermarkStore.upsert(profile._id, 'pull', event.watermark);
    }


  }

  chrome.alarms.create('dwn.pull', { delayInMinutes: 1 });
}