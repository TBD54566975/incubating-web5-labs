import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import { generateKeyPair, DID } from '@decentralized-identity/ion-tools';


const authnKeyPair = await generateKeyPair('Ed25519');
const authnKeyId = 'key-1';

const createOptions = {
  publicKeys: [
    {
      id: authnKeyId,
      type: 'JsonWebKey2020',
      publicKeyJwk: authnKeyPair.publicJwk,
      purposes: ['authentication']
    }
  ],
  services: [
    {
      'id': 'dwn',
      'type': 'DecentralizedWebNode',
      'serviceEndpoint': {
        'nodes': ['http://localhost:3000/dwn']
      }
    }
  ]
};

const did = new DID({ content: createOptions });
const longFormDID = await did.getURI('long');
const ops = await did.getAllOperations();

const kid = `${longFormDID}:${authnKeyId}`
const alg = 'EdDSA';

authnKeyPair.privateJwk.alg = alg;
authnKeyPair.privateJwk.kid = kid;

authnKeyPair.publicJwk.alg = alg;
authnKeyPair.publicJwk.kid = kid;

const state = {
  longFormDID,
  ops,
  signatureMaterial: {
    privateJwk: authnKeyPair.privateJwk,
    protectedHeader: {
      alg,
      kid
    }
  }
};

// __filename and __dirname are not defined in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

fs.writeFileSync(`${__dirname}/did-state.json`, JSON.stringify(state, null, 2));