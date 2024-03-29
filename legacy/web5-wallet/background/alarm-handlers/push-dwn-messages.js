import * as DWN from '../dwn';
import { ProfileStore, WatermarkStore } from '../db';
import { DIDResolver } from '../lib/did-resolver';
import { CID } from 'multiformats/cid';

// did methods that support the `service` property.
// TODO: think about better way to do this
const compatibleDidMethods = new Set(['ion']);

export async function pushDwnMessages() {
  const profiles = await ProfileStore.getAllProfiles();

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
    const watermark = await WatermarkStore.getWatermark(profile._id, 'push');
    
    if (watermark) {
      watermarkKey = watermark.key;
      console.log('[push] watermark found', watermarkKey);
    }


    const tenantEvents = await DWN.messageStore.getEventLog(profile.did, watermarkKey);
    console.log(`[push] pushing dwn messages to ${dwnHost} for ${profile.name}. ${tenantEvents.length} messages to push`, tenantEvents);
    let numAccepts = 0;
    let numConflicts = 0;
    
    for (let event of tenantEvents) {
      const messageCid = CID.parse(event.messageCid);
      const message = await DWN.messageStore.get(messageCid);
      
      try {
        const sendResult = await DWN.send(dwnHost, message);
        console.log('[push] push result', sendResult);

        if (sendResult.status.code === 202 || sendResult.status.code === 409) {
          if (sendResult.status.code === 202) {
            numAccepts += 1;
          } else if (sendResult.status.code === 409) {
            numConflicts += 1;
          }
          
          await WatermarkStore.upsert(profile._id, 'push', event.watermark);
        }
      } catch(e) {
        console.error(`[push] [DWN.send] error: ${e}`);
      }
    }

    console.log(`[push] # accepts: ${numAccepts}. # dupes: ${numConflicts}`);
  }

  chrome.alarms.create('dwn.push', { delayInMinutes: 1 });
}