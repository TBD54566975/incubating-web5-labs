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
   * @param {string} profileId 
   * @param {string} key 
   * @returns {Promise<void>}
   */
  static async upsert(profileId, kind, key) {
    const watermark = await WatermarkStore.getWatermark(profileId, kind);

    if (watermark) {
      await db.put({
        _id  : watermark._id,
        _rev : watermark._rev, 
        profileId,
        key,
      });

      console.log('[watermark-store.put]');
    } else {
      await db.put({
        _id: this.#generateId(profileId, kind),
        profileId,
        kind,
        key
      });

      console.log('[watermark-store.create]');
    }
  }

  /**
   * 
   * @param {string} kind 
   * @param {string} profileId
   * @returns {Promise<Watermark>}
   */
  static async getWatermark(profileId, kind) {
    const watermarkId = WatermarkStore.#generateId(profileId, kind);

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

  static #generateId(profileId, kind) {
    return `watermark:${profileId}:${kind}`;
  }

  static async createIndexes() {}
}