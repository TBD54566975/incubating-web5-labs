import * as DWN from '../dwn';
import { IdentityStore, WatermarkStore } from '../db';
import { DIDResolver } from '../lib/did-resolver';
import { CID } from 'multiformats/cid';

// did methods that support the `service` property.
// TODO: think about better way to do this
const compatibleDidMethods = new Set(['ion']);

export async function pullDwnMessages() {
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
    console.log(`pulling dwn messages for ${identity.did}`);

    let watermarkKey; 
    const watermark = await WatermarkStore.getWatermark('push', identity._id);
    
    if (watermark) {
      watermarkKey = watermark.key;
    }

    console.log('watermark', watermark);
  }
}