import { v4 as uuidv4 } from 'uuid';
import { db } from './client';

/**
 * @typedef {object} Watermark
 * @property {string} _id
 * @property {string} _rev
 * @property {'push' | 'pull'} kind
 * @property {string} key
 */

export class WatermarkStore {

  /**
   * 
   * @param {string} kind 
   * @param {string} identityId 
   * @param {string} key 
   * @returns {Promise<void>}
   */
  static async upsert(kind, identityId, key) {
    const watermark = await WatermarkStore.getWatermark(kind, identityId);

    if (watermark) {
      return db.put({
        _id  : watermark._id,
        _rev : watermark._rev, 
        key,
      });
    } else {
      return db.put({
        _id  : uuidv4(),
        type : '__watermark__',
        identityId,
        kind,
        key
      });
    }
  }

  /**
   * 
   * @param {string} kind 
   * @param {string} identityId
   * @returns {Promise<Watermark>}
   */
  static async getWatermark(kind, identityId) {
    const { docs } = await db.find({
      selector: {
        type: '__watermark__',
        kind,
        identityId
      },
      limit: 1
    });

    return docs[0];
  }
}