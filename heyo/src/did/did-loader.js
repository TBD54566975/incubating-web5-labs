import fs from 'node:fs';

import { config } from '../config/index.js';
import { DIDIon } from './did-ion.js';

let didState;

if (fs.existsSync(config.did.storagePath)) {
  const didStateJson = fs.readFileSync(config.did.storagePath, { encoding: 'utf-8' });
  didState = JSON.parse(didStateJson);
} else {
  if (config.did.method === 'ion') {
    didState = await DIDIon.generate({ serviceEndpoint: 'https://dwn-aggregator.faktj7f1fndve.ap-southeast-2.cs.amazonlightsail.com/' });
    fs.writeFileSync(config.did.storagePath, JSON.stringify(didState, null, 2));
  } else {
    throw new Error(`DID Method ${config.did.method} not supported`);
  }
}

export class DidLoader {
  static getDid() {
    return didState.did;
  }

  static getSignatureMaterial() {
    const { privateJwk } = didState.keys['key-1'];
    const { alg, kid } = privateJwk;
    const fullKid = `${didState.did}#${kid}`;

    return { privateJwk: privateJwk, protectedHeader: { alg, kid: fullKid } };
  }
}