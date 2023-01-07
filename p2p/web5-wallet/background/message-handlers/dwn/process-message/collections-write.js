import * as DWN from '../../../dwn';
import { DIDResolver } from '../../../lib/did-resolver';
import { CollectionsWrite } from '@tbd54566975/dwn-sdk-js';

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

  if (result.status.code !== 202) {
    return {
      record: collectionsWriteJSON,
      result
    };
  }

  //! send message to recipient
  // TODO: consider doing this elsewhere. definitely need to abstract out into a reusable method
  // once we introduce other message types that can have `recipient`.

  //! **WARNING**: having this here can cause a weird race condition. Imagine Alice is sending
  //! a message to bob. bob's remote dwn recieves the message which is synced to his device.
  //! He then sends a reply message to alice _before_ the _original_ message synced to alice's DWN. 
  //! if that message is referenced as `parentId` in bob's message to alice
  //! then alice's remote dwn will reject the message 
  const { recipient } = collectionsWrite.message.descriptor;
  if (recipient && recipient !== identity.did) {
    const dwnHosts = await DIDResolver.getDWNHosts(recipient);

    // TODO: handle multiple dwn hosts. send to all? send to at least 1 successfully?
    const [ dwnHost ] = dwnHosts;

    if (dwnHost) {
      const recipientCollectionsWrite = await CollectionsWrite.create({
        ...data.message,
        target         : recipient,
        signatureInput : signatureMaterial
      });

      try {
        // TODO: handle unsuccessful responses. retry? cadence?
        const sendResult = await DWN.send(dwnHost, recipientCollectionsWrite.toJSON());
        console.log('send message to recipient result:', sendResult);
      } catch(e) {
        // TODO: figure out where to retry these sends
        console.error('failed to send message to recipient. error:', e, 'message:', recipientCollectionsWrite.toJSON());
      }
    }
  }

  return {
    record: collectionsWriteJSON,
    result
  };
}