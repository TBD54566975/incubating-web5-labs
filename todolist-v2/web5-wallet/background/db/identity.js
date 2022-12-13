import { DIDKey } from '../lib/did-key';

/**
 * @typedef {object} IdentityRecord
 * @property {string} name
 * @property {string} did
 * @property {object} publicJWK
 * @property {enum} publicJWK.alg
 * @property {enum} publicJWK.crv
 * @property {enum} publicJWK.kty
 * @property {enum} publicJWK.use
 * @property {string} publicJWK.x
 * @property {object} privateJWK
 * @property {enum} privateJWK.alg
 * @property {enum} privateJWK.crv
 * @property {enum} privateJWK.kty
 * @property {enum} privateJWK.use
 * @property {string} privateJWK.x
 * @property {string} privateJWK.d
 */

/**
 * @typedef {object} SignatureMaterial
 * @property {object} protectedHeader
 * @property {string} protectedHeader.alg
 * @property {string} protectedHeader.kid
 * @property {object} privateJWK
 * @property {enum} privateJWK.alg
 * @property {enum} privateJWK.crv
 * @property {enum} privateJWK.kty
 * @property {enum} privateJWK.use
 * @property {string} privateJWK.x
 * @property {string} privateJWK.d
 */

export class Identity {
  /**
   * @param {import('rxdb').RxCollection} client 
   */
  constructor(client) {
    this.client = client;
  }

  async create(name) {
    const { did, privateJWK, publicJWK } = await DIDKey.generate();

    return this.client.insert({ name, did, privateJWK, publicJWK });
  }

  /**
   * 
   * @param {string} name
   * @returns {IdentityRecord}
   */
  async getByName(name) {
    const result = await this.client.findOne({
      selector: { name }
    }).exec();

    if (result) {
      return result.toJSON();
    }
  }

  /**
   * 
   * @param {string} did 
   * @returns {IdentityRecord}
   */
  async getByDID(did) {
    const result = await this.client.findOne({
      selector: { did }
    }).exec();

    if (result) {
      return result.toJSON();
    }
  }

  /**
   * **note**: works for did:key only right now!
   * @param {IdentityRecord} identity 
   * @returns {SignatureMaterial}
   */
  getDWNSignatureMaterial(identity) {
    const { did, privateJWK } = identity;
    const [_, __, id] = did.split(':');

    return {
      protectedHeader: { alg: privateJWK.alg, kid: `${did}#${id}` },
      jwkPrivate: privateJWK
    };
  }

  query(query = {}, options = {}) {
    const findArg = { selector: query, ...options };

    return this.client.find(findArg).exec();
  }
}