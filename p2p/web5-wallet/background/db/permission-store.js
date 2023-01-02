import { v4 as uuidv4 } from 'uuid';
import { db } from './client';

/**
 * @typedef {object} Permission
 * @property {string} domain
 * @property {string} did
 * @property {boolean} isAllowed
 */


export class PermissionStore {
  static createPermission(domain, did, isAllowed) {
    return db.put({
      _id  : uuidv4(),
      type : '__access_control__',
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
        type: '__access_control__',
        domain 
      },
      limit: 1
    });

    return docs[0];
  }
}