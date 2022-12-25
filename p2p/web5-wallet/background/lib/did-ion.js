import { IonDid } from '@decentralized-identity/ion-sdk';
import * as ed25519 from '@noble/ed25519';
import * as secp256k1 from '@noble/secp256k1';
import { base64url } from 'multiformats/bases/base64';

/**
 * @typedef {object} GenerateOptions
 * @property {string} [serviceEndpoint] - optional serviceEndpoint to include in DID Doc
 */


export class DIDION {
  /**
   * 
   * @param {object} options
   * @property {string} [serviceEndpoint] - optional serviceEndpoint to include in DID Doc
   */
  static async generate(options = {}) {
    const recoveryKeyPair = DIDION.#generateSECP256K1KeyPair();
    const updateKeyPair = DIDION.#generateSECP256K1KeyPair();
    const authKeyPair = await DIDION.#generateED25519KeyPair(); 

    const didDocument = {
      publicKeys: [{
        'id'           : 'publicKeyModelEd25519',
        'type'         : 'JsonWebKey2020',
        'publicKeyJwk' : authKeyPair.publicJWK,
        'purposes'     : ['authentication', 'keyAgreement']
      }]
    };


    if (options.serviceEndpoint) {
      didDocument.services = [{
        id              : 'dwn',
        type            : 'DecentralizedWebNode',
        serviceEndpoint : {
          nodes: [options.serviceEndpoint]
        }
      }];
    }

    const longFormDID = await IonDid.createLongFormDid({ 
      recoveryKey : recoveryKeyPair.publicJWK, 
      updateKey   : updateKeyPair.publicJWK, 
      didDocument 
    });

    return {
      longFormDID,
      recoveryKeyPair,
      updateKeyPair,
      authKeyPair
    };
  }

  static #generateSECP256K1KeyPair() {
    const privateKeyBytes = secp256k1.utils.randomPrivateKey();
    const publicKeyBytes =  secp256k1.getPublicKey(privateKeyBytes);

    // ensure public key is in uncompressed format so we can convert it into both x and y value
    let uncompressedPublicKeyBytes;
    if (publicKeyBytes.byteLength === 33) {
      // this means given key is compressed
      const publicKeyHex = secp256k1.utils.bytesToHex(publicKeyBytes);
      const curvePoints = secp256k1.Point.fromHex(publicKeyHex);
      uncompressedPublicKeyBytes = curvePoints.toRawBytes(false); // isCompressed = false
    } else {
      uncompressedPublicKeyBytes = publicKeyBytes;
    }
    
    // the first byte is a header that indicates whether the key is uncompressed (0x04 if uncompressed), we can safely ignore
    // bytes 1 - 32 represent X
    // bytes 33 - 64 represent Y
    
    // skip the first byte because it's used as a header to indicate whether the key is uncompressed
    const x = base64url.baseEncode(uncompressedPublicKeyBytes.subarray(1, 33));
    const y = base64url.baseEncode(uncompressedPublicKeyBytes.subarray(33, 65));
    
    const publicJWK = {
      kty : 'EC',
      crv : 'secp256k1',
      x,
      y
    };

    const privateJWK = { 
      ...publicJWK, 
      d: base64url.baseEncode(privateKeyBytes)
    };

    return { publicJWK, privateJWK };
  }

  static async #generateED25519KeyPair() {
    const privateKeyBytes = ed25519.utils.randomPrivateKey();
    const publicKeyBytes = await ed25519.getPublicKey(privateKeyBytes);

    const publicJWK = {
      alg : 'EdDSA',
      kty : 'OKP',
      crv : 'Ed25519',
      x   : base64url.baseEncode(publicKeyBytes)
    };
    
    const privateJWK = { 
      ...publicJWK, 
      d: base64url.baseEncode(privateKeyBytes)
    };

    return { publicJWK, privateJWK };
  }
}