import { v4 as uuidv4 } from 'uuid';
import { db } from './client';

/**
 * @typedef {object} PrivateJWK
 * @property {'ES256K' | 'EdDSA'} alg
 * @property {'Ed25519'|'secp256k1'} crv
 * @property {string} d
 * @property {string} kid
 * @property {string} x
 * @property {string} [y]
 */

/**
 * @typedef {object} PublicJWK
 * @property {'ES256K' | 'EdDSA'} alg
 * @property {'Ed25519'|'secp256k1'} crv
 * @property {string} d
 * @property {string} kid
 * @property {string} x
 * @property {string} x
 * @property {string} [y]
 */

/**
 * @typedef Key
 * @property {string} did 
 * @property {PrivateJWK | PublicJWK} jwk 
 * @property {string} kid 
 * @property {'private' | 'public'} kind
 */

export class KeyStore {
  /**
   * 
   * @param {string} did 
   * @param {PrivateJWK | PublicJWK} jwk 
   * @param {string} kid 
   * @param {'private' | 'public'} kind 
   * @returns {Promise<void>}
   */
  static async save(did, jwk, kid, kind) {
    return db.put({ _id: uuidv4(), type: '__key__', did, jwk, kid, kind });
  }

  /**
   * 
   * @param {string} kid 
   * @returns {Promise<Key>}
   */
  static async getByKID(kid) {
    const { docs } = await db.find({
      selector : { kid },
      limit    : 1
    });

    return docs[0];
  }

  /**
   * 
   * @param {string} did 
   * @returns {Promise<Key>}
   */
  static async getByDID(did) {
    const { docs } = await db.find({
      selector: { 
        type: '__key__',
        did 
      },
      limit: 1
    });

    return docs[0];
  }
}