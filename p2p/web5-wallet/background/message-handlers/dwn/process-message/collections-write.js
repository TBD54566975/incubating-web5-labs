import * as DWN from '../../../dwn';

import { CollectionsWrite } from '@tbd54566975/dwn-sdk-js';
import { DIDResolver } from '../../../lib/did-resolver';

/**
 * TODO: fill out
 * @param {*} ctx 
 * @param {*} data 
 */
export async function handleCollectionsWrite(ctx, data) {
  const { identity, signatureMaterial } = ctx;
  
  // TODO: ew. `data.data` need to think of less confusing property names
  if (data.data) {
    const { dataFormat } = data.message;

    // handle data encoding
    if (dataFormat) {
      if (dataFormat === 'application/json') {
        const jsonStringified = JSON.stringify(data.data);
        const jsonBytes = new TextEncoder().encode(jsonStringified);

        data.message.data = jsonBytes;
      }
    }
  }

  const collectionsWrite = await CollectionsWrite.create({
    ...data.message,
    target         : identity.did,
    signatureInput : signatureMaterial
  });

  const collectionsWriteJSON = collectionsWrite.toJSON();

  const dwn = await DWN.open();
  const result = await dwn.processMessage(collectionsWriteJSON);

  //! send message to recipient 
  // const { recipient } = collectionsWrite.message.descriptor;
  // if (recipient && recipient !== identity.did) {
  //   const dwnHosts = await DIDResolver.getDWNHosts(recipient);

  // TODO: handle multiple dwn hosts. send to all? send to at least 1 successfully?
  // const [ dwnHost ] = dwnHosts;

  // if (dwnHost) {
  //   TODO: handle unsuccessful responses. retry? cadence?
  //   const sendResult = await DWN.send(dwnHost, collectionsWriteJSON);
  //   console.log('send message to recipient result:', sendResult);
  // }

  return {
    record: collectionsWrite.toJSON(),
    result
  };
}