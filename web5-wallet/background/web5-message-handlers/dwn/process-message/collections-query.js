import { CollectionsQuery } from '@tbd54566975/dwn-sdk-js';
import * as DWN from '../../../dwn';

/**
 * TODO: fill out
 * @param {object} ctx 
 * @param {any} [data] 
 */
export async function handleCollectionsQuery(ctx, data) {
  const { profile, signatureMaterial } = ctx;
  
  const queryOptions = {
    ...data.message,
    target         : profile.did,
    signatureInput : signatureMaterial
  };
  const collectionsQuery = await CollectionsQuery.create(queryOptions);
  console.log(collectionsQuery.message);

  const dwn = await DWN.open();
  const result =  await dwn.processMessage(collectionsQuery.toJSON());

  return result;
}