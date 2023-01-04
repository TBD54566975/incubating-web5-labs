import { client } from './client';

/**
 * @typedef {object} Watermark
 * @property {string} _id
 * @property {string} _rev
 * @property {'push' | 'pull'} kind
 * @property {string} key
 */

const db = new client('watermark-store');

export class WatermarkStore {

  /**
   * 
   * @param {string} kind 
   * @param {string} identityId 
   * @param {string} key 
   * @returns {Promise<void>}
   */
  static async upsert(identityId, kind, key) {
    const watermark = await WatermarkStore.getWatermark(identityId, kind);

    if (watermark) {
      await db.put({
        _id  : watermark._id,
        _rev : watermark._rev, 
        identityId,
        key,
      });

      console.log('[watermark-store.put]');
    } else {
      await db.put({
        _id: this.#generateId(identityId, kind),
        identityId,
        kind,
        key
      });

      console.log('[watermark-store.create]');
    }
  }

  /**
   * 
   * @param {string} kind 
   * @param {string} identityId
   * @returns {Promise<Watermark>}
   */
  static async getWatermark(identityId, kind) {
    const watermarkId = WatermarkStore.#generateId(identityId, kind);

    try {
      return await db.get(watermarkId);
    } catch(e) {
      if (e.status === 404) {
        return undefined;
      } else {
        throw e;
      }
    }
  }

  static #generateId(identityId, kind) {
    return `watermark:${identityId}:${kind}`;
  }

  static async createIndexes() {}
}