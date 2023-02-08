import { v4 as uuidv4 } from 'uuid';
import { resolve } from '@decentralized-identity/ion-tools';

export class RemoteDwnClient {
  static async send(dWebMessage, target) {
    const payload = {
      jsonrpc : '2.0',
      id      : uuidv4(),
      method  : 'dwn.processMessage',
      params  : {
        message: dWebMessage,
        target
      }
    };

    const dwnHost = await RemoteDwnClient.getTargetDwnHost(target);
    
    const resp = await fetch(dwnHost, {
      method : 'POST',
      body   : JSON.stringify(payload)
    });

    const { result, error } = await resp.json();

    return result;
  }

  static async getTargetDwnHost(did) {
    const dwnHosts = [];
    
    try {
      const { didDocument } = await resolve(did);
  
      const { service = [] } = didDocument;
  
      for (const svc of service) {
        if (svc.type === 'DecentralizedWebNode') {
          return svc.serviceEndpoint.nodes;
        }
      }
  
      if (dwnHosts.length === 0) {
        throw new Error(`target ${did} does not have any DWNs listed in their DID Document`);
      }
    } catch (error) {
      throw new Error(`Failed to resolve recipient DID: ${did}. Error: ${error.message}`);
    }
  }
}