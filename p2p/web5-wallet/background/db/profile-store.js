import { client } from './client';
import { DIDKey } from '../lib/did-key';
import { DIDIon } from '../lib/did-ion';
import { KeyStore } from './key-store';
import dayjs from 'dayjs';

/**
 * @typedef {object} Profile
 * @property {string} _id
 * @property {string} name
 * @property {string} did
 * @property {'key' | 'ion'} didMethod
 * @property {'string'} dateCreated
 */

/**
 * @typedef {object} SignatureMaterial
 * @property {object} protectedHeader
 * @property {string} protectedHeader.alg
 * @property {string} protectedHeader.kid
 * @property {import('./key-store').PrivateJWK} privateJwk
 */

const db = new client('profile-store');
export class ProfileStore {
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
      await db.post({ did, didMethod, name, dateCreated: dayjs().toISOString() });
    } else if (didMethod === 'ion') {
      
      // TODO: save recovery and update keys
      // TODO: save ops at some point maybe
      // TODO: save authn public key?
      const { authnKeyPair, longFormDID } = await DIDIon.generate(options);

      await KeyStore.save(longFormDID, authnKeyPair.privateJwk, authnKeyPair.privateJwk.kid, 'private');

      await db.post({ did: longFormDID, didMethod, name, dateCreated: dayjs().toISOString() });
    } else {
      throw new Error(`did method ${didMethod} not supported`);
    }
  }

  /**
   * @param {string} name
   * @returns {Promise<Profile>}
   */
  static async getByName(name) {
    const { docs } = await db.find({
      selector: { 
        name 
      },
      limit: 1
    });

    return docs[0];
  }

  /**
   * @param {string} did 
   * @returns {Profile}
   */
  static async getByDID(did) {
    const { docs } = await db.find({
      selector: { 
        did 
      },
      limit: 1
    });

    return docs[0];
  }

  /**
   * 
   * @returns {Promise<Profile[]>}
   */
  static async getAllProfiles() {
    const { rows } = await db.allDocs({ include_docs: true });
    const docs = [];

    for (let row of rows) {
      if (row.id[0] === '_') {
        continue;
      }
      
      docs.push(row.doc);
    }

    return docs;
  }

  /**
   * TODO: move to another place
   * @param {Profile} Profile 
   * @returns {SignatureMaterial}
   */
  static async getDWNSignatureMaterial(Profile) {
    const { did } = Profile;
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

  static async createIndexes() {
    await db.createIndex({ 
      index: { fields: ['name'] }
    });

    await db.createIndex({ 
      index: { fields: ['did'] }
    });
  }
}