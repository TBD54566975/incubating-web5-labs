import { RecordsQuery } from '@tbd54566975/dwn-sdk-js';
import * as DWN from '../../../dwn';

/**
 * TODO: fill out
 * @param {object} ctx 
 * @param {any} [data] 
 */
export async function handleRecordsQuery(ctx, data) {
  const { profile, signatureMaterial } = ctx;
  
  const queryOptions = {
    ...data.message,
    target         : profile.did,
    signatureInput : signatureMaterial
  };
  const recordsQuery = await RecordsQuery.create(queryOptions);

  const dwn = await DWN.open();
  const result =  await dwn.processMessage(recordsQuery.toJSON());

  return result;
}