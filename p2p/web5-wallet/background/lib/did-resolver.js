import { DIDIon } from './did-ion';
import { DIDKey } from './did-key';

const resolvers = {
  'ion' : DIDIon.resolve,
  'key' : DIDKey.resolve
};

export class DIDResolver {
  static async resolve(did) {
    const splitDID = did.split(':', 3);

    const didMethod = splitDID[1];
    const _resolve = resolvers[didMethod];
    // TODO: handle resolution failure
    // TODO: potentially cache did doc with some TTL
    // TODO: handle invalid DID Document 
    return _resolve(did);
  }

  static async getDWNHosts(did) {
    // TODO: throw exception if did method doesnt support `service` or just return empty array?
    const { didDocument } = await DIDResolver.resolve(did);

    if (!didDocument) {
      return [];
    }

    const { service = [] } = didDocument;
    let dwnHosts = [];
    
    for (const svc of service) {
      if (svc.type === 'DecentralizedWebNode') {
        dwnHosts = svc.serviceEndpoint.nodes;
        break;
      }
    }

    // TODO: handle invalid URL
    return dwnHosts;
  }
}