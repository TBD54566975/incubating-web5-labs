import { v4 as uuidv4 } from 'uuid';
import { db } from './client';
import { DIDKey } from '../lib/did-key';
import { DIDIon } from '../lib/did-ion';
import { KeyStore } from './key-store';
import dayjs from 'dayjs';

/**
 * @typedef {object} Identity
 * @property {string} name
 * @property {string} did
 * @property {'key' | 'ion'} didMethod
 */

/**
 * @typedef {object} SignatureMaterial
 * @property {object} protectedHeader
 * @property {string} protectedHeader.alg
 * @property {string} protectedHeader.kid
 * @property {import('./key-store').PrivateJWK} privateJwk
 */

export class IdentityStore {
  /**
   * @param {string} name - human-friendly name
   * @param {'key' | 'ion'} didMethod
   * @param {object} options
   * @returns {Promise<void>}
   */
  static async create(name, didMethod, options = {}) {
    // TODO: decouple did-generation logic
    if (didMethod === 'key') {
      const { did, privateJWK } = await DIDKey.generate();
      const didDoc = DIDKey.resolve(did);

      await KeyStore.save(did, privateJWK, didDoc.authentication[0], 'private');
      await db.put({ _id: uuidv4(), type: '__identity__', did, didMethod, name, dateCreated: dayjs().toISOString() });
    } else if (didMethod === 'ion') {
      
      // TODO: save recovery and update keys
      // TODO: save ops at some point maybe
      // TODO: save authn public key?
      const { authnKeyPair, longFormDID } = await DIDIon.generate(options);

      await KeyStore.save(longFormDID, authnKeyPair.privateJwk, authnKeyPair.privateJwk.kid, 'private');

      await db.put({ _id: uuidv4(), type: '__identity__', did: longFormDID, didMethod, name, dateCreated: dayjs().toISOString() });
    } else {
      throw new Error(`did method ${didMethod} not supported`);
    }
  }

  /**
   * @param {string} name
   * @returns {Promise<Identity>}
   */
  static async getByName(name) {
    const { docs } = await db.find({
      selector: { 
        type: '__identity__',
        name 
      },
      limit: 1
    });

    return docs[0];
  }

  /**
   * @param {string} did 
   * @returns {Identity}
   */
  static async getByDID(did) {
    const { docs } = await db.find({
      selector: { 
        type: '__identity__',
        did 
      },
      limit: 1
    });

    return docs[0];
  }

  static async getAllIdentities() {
    const { docs } = await db.find({
      selector: { 
        type: '__identity__'
      },
    });

    return docs;
  }

  /**
   * TODO: move to another place
   * @param {Identity} identity 
   * @returns {SignatureMaterial}
   */
  static async getDWNSignatureMaterial(identity) {
    const { did } = identity;
    const { jwk } = await KeyStore.getByDID(did);

    let { alg, kid } = jwk;

    // TODO: talk to henry about this
    if (!kid.includes(did)) {
      kid = `${did}#${kid}`;
    }

    return {
      protectedHeader : { alg, kid },
      privateJwk      : jwk
    };
  }
}