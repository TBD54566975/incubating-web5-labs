import * as ed25519 from '@noble/ed25519';
import * as varint from 'varint';

import { base58btc } from 'multiformats/bases/base58';
import { base64url } from 'multiformats/bases/base64';

// multicodec code for Ed25519 keys
const ED25519_CODEC_ID = varint.encode(parseInt('0xed', 16));

/**
 * @typedef {Object} GenerateDIDResult
 * @property {string} did - the generated DID
 * @property {PublicJWK} publicJWK - the public key of the private key that was used to generate the DID
 * @property {PrivateJWK} privateJWK - the private key used to generate the DID
 */

/**
 * * [DID Spec Doc](https://www.w3.org/TR/did-core/)
 * * [DID-Key Spec Draft](https://w3c-ccg.github.io/did-method-key/)
 */
export class DIDKey {
  /**
   * generates a new ed25519 public/private keypair. Creates a DID using the private key
   * @return {GenerateDIDResult} did, public key, private key
   */
  static async generate() {
    const privateKeyBytes = ed25519.utils.randomPrivateKey();
    const publicKeyBytes = await ed25519.getPublicKey(privateKeyBytes);

    const idBytes = new Uint8Array(publicKeyBytes.byteLength + ED25519_CODEC_ID.length);
    idBytes.set(ED25519_CODEC_ID, 0);
    idBytes.set(publicKeyBytes, ED25519_CODEC_ID.length);

    const id = base58btc.encode(idBytes);
    const did = `did:key:${id}`;
    const keyId = `${did}#${id}`;

    // TODO: `publicJWK` code is duplicated in resolve. move JWK creation into a separate method (Moe - 08/01/2022)
    const publicJWK = {
      alg : 'EdDSA',
      crv : 'Ed25519',
      kid : keyId,
      kty : 'OKP',
      use : 'sig',
      x   : base64url.baseEncode(publicKeyBytes)
    };

    const privateJWK = { ...publicJWK, d: base64url.baseEncode(privateKeyBytes) };

    return { did, publicJWK, privateJWK };
  }

  static resolve(did) {
    const [scheme, method, id] = did.split(':');

    if (scheme !== 'did') {
      throw new Error('malformed scheme');
    }

    if (method !== 'key') {
      throw new Error('did method MUST be "key"');
    }

    const idBytes = base58btc.decode(id);
    const publicKeyBytes = idBytes.slice(ED25519_CODEC_ID.length);

    const publicJwk = {
      alg : 'EdDSA',
      crv : 'Ed25519',
      kty : 'OKP',
      use : 'sig',
      x   : base64url.baseEncode(publicKeyBytes)
    };

    const keyId = `${did}#${id}`;

    const didDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1',
        'https://w3id.org/security/suites/x25519-2020/v1'
      ],
      'id'                 : did,
      'verificationMethod' : [{
        id           : keyId,
        type         : 'JsonWebKey2020',
        controller   : did,
        publicKeyJwk : publicJwk
      }],
      'authentication'       : [keyId],
      'assertionMethod'      : [keyId],
      'capabilityDelegation' : [keyId],
      'capabilityInvocation' : [keyId]
    };

    return didDocument;
  }
}