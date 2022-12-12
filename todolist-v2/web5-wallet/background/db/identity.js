import { DIDKey } from '../lib/did-key';

export class Identity {
  constructor(client) {
    this.client = client;
  }

  async create(name) {
    const { did, privateJWK, publicJWK } = await DIDKey.generate();

    return this.client.insert({ name, did, privateJWK, publicJWK });
  }

  async getByName(name) {
    const result = await this.client.findOne({
      selector: { name }
    }).exec();

    if (result) {
      return result.toJSON();
    }
  }

  query(query = {}, options = {}) {
    const findArg = { selector: query, ...options };

    return this.client.find(findArg).exec();
  }
}