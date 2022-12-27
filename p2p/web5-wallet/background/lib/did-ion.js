import { DID, generateKeyPair, resolve as _resolve } from '@decentralized-identity/ion-tools';

/**
 * @typedef {object} GenerateOptions
 * @property {string} [serviceEndpoint] - optional serviceEndpoint to include in DID Doc
 */

/**
 * @typedef {object} KeyPair
 * @property {import('../db/key-store').PrivateJWK} privateJwk
 * @property {import('../db/key-store').PrivateJWK} publicJwk
 */

/**
 * @typedef {object} DIDIonGenerateResult
 * @property {KeyPair} authnKeyPair
 * @property {string} longFormDID
 * @property {Array<object>} ops
 * @property {KeyPair} recoveryKeyPair
 * @property {KeyPair} updateKeyPair
 */
export class DIDIon {
  /**
   * 
   * @param {object} options
   * @property {string} [options.serviceEndpoint] - optional serviceEndpoint to include in DID Doc
   * @returns {DIDIonGenerateResult}
   */
  static async generate(options = {}) {
    const updateKeyPair = await generateKeyPair('secp256k1');
    const recoveryKeyPair = await generateKeyPair('secp256k1');
    
    const authnKeyPair = await generateKeyPair('Ed25519');
    const authnKeyId = 'key-1';

    const createOptions = {
      publicKeys: [
        {
          id           : authnKeyId,
          type         : 'JsonWebKey2020',
          publicKeyJwk : authnKeyPair.publicJwk,
          purposes     : ['authentication']
        }
      ],
    };

    if (options.serviceEndpoint) {
      createOptions.services = [
        {
          id              : 'dwn-1',
          type            : 'DWN',
          serviceEndpoint : options.serviceEndpoint
        }
      ];
    }

    const did = new DID({ content: createOptions });
    const longFormDID = await did.getURI('long');
    const ops = await did.getAllOperations();

    authnKeyPair.privateJwk.alg = 'EdDSA';
    authnKeyPair.privateJwk.kid = authnKeyId;
    
    authnKeyPair.publicJwk.alg = 'EdDSA';
    authnKeyPair.publicJwk.kid = authnKeyId;

    return {
      authnKeyPair,
      longFormDID,
      ops,
      recoveryKeyPair,
      updateKeyPair,
    };
  }

  static async resolve(did) {
    const { didDocument } = await _resolve(did);

    return didDocument;
  }
}