import * as DWN from '../../../dwn';
import { DIDResolver } from '../../../lib/did-resolver';
import { RecordsWrite } from '@tbd54566975/dwn-sdk-js';

/**
 * TODO: fill out
 * @param {*} ctx 
 * @param {*} data 
 */
export async function handleRecordsWrite(ctx, data) {
  const { profile, signatureMaterial } = ctx;
  
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

  let recordsWrite;

  // the following conditional is a convenience provided via the web5 api to clobber a
  // `RecordsWrite` without having to manually copy over the immutable properties
  // if this is the initial write
  if (data.baseEntry === undefined) {
    console.log('RecordsWrite without base entry');
    let recordsWriteOptions = {
      ...data.message,
      target         : profile.did,
      signatureInput : signatureMaterial,
    };

    recordsWrite = await RecordsWrite.create(recordsWriteOptions);
  } else { // this is an "update" to an existing record
    console.log('RecordsWrite with base entry');
    let createFromOptions = {
      ...data.message,
      target                      : profile.did,
      unsignedRecordsWriteMessage : data.baseEntry,
      signatureInput              : signatureMaterial,
    };

    recordsWrite = await RecordsWrite.createFrom(createFromOptions);
  }

  const recordsWriteJSON = recordsWrite.toJSON();

  const dwn = await DWN.open();
  const result = await dwn.processMessage(recordsWriteJSON);
  console.log('RecordsWrite result:');
  console.log(result);

  if (result.status.code !== 202) {
    return {
      record: recordsWriteJSON,
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
  const { recipient } = recordsWrite.message.descriptor;
  if (recipient && recipient !== profile.did) {
    const dwnHosts = await DIDResolver.getDWNHosts(recipient);

    // TODO: handle multiple dwn hosts. send to all? send to at least 1 successfully?
    const [ dwnHost ] = dwnHosts;

    if (dwnHost) {
      const recipientRecordsWrite = await RecordsWrite.create({
        // copying over dateCreated & dateModified is required because it is included in the deterministic
        // generation of recordId and contextId
        dateCreated    : recordsWrite.message.descriptor.dateCreated,
        dateModified   : recordsWrite.message.descriptor.dateModified,
        target         : recipient,
        signatureInput : signatureMaterial,
        ...data.message,
      });

      try {
        // TODO: handle unsuccessful responses. retry? cadence?
        const sendResult = await DWN.send(dwnHost, recipientRecordsWrite.toJSON());
        console.log('send message to recipient result:', sendResult);
      } catch(e) {
        // TODO: figure out where to retry these sends
        console.error('failed to send message to recipient. error:', e, 'message:', recipientRecordsWrite.toJSON());
      }
    }
  }

  return {
    record: recordsWriteJSON,
    result
  };
}