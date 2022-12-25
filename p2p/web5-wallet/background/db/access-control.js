/**
 * @typedef {object} Permission
 * @property {string} domain
 * @property {string} did
 * @property {boolean} isAllowed
 */


export class AccessControl {
  /**
   * @param {import('rxdb').RxCollection} client 
   */
  constructor(client) {
    this.client = client;
  }

  createPermission(domain, did, isAllowed) {
    return this.client.insert({ domain, did, isAllowed });
  }

  /**
   * 
   * @param {*} domain - the domain to return permissions for
   * @returns {Permission | Undefined}
   */
  async getDomainPermissions(domain) {
    const result = await this.client.findOne({
      selector: { domain }
    }).exec();

    if (result) {
      return result.toJSON();
    }
  }
}