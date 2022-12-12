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

  async getDomainPermissions(domain) {
    const result = await this.client.findOne({
      selector: { domain }
    }).exec();

    if (result) {
      return result.toJSON();
    }
  }
}