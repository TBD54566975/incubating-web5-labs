import { v4 as uuidv4 } from 'uuid';
import { client } from './client';

/**
 * @typedef {object} Permission
 * @property {string} domain
 * @property {string} did
 * @property {boolean} isAllowed
 */

const db = new client('permission-store');
export class PermissionStore {
  static createPermission(domain, did, isAllowed) {
    return db.post({
      domain, 
      did, 
      isAllowed 
    });
  }

  /**
   * 
   * @param {string} domain - the domain to return permissions for
   * @returns {Promise<Permission | undefined>}
   */
  static async getDomainPermissions(domain) {
    const { docs } = await db.find({
      selector: { 
        domain 
      },
      limit: 1
    });

    return docs[0];
  }

  static async createIndexes() {
    await db.createIndex({ 
      index: { fields: ['domain'] }
    });
  }
}