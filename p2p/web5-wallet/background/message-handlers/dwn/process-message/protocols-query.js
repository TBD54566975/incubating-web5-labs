import * as DWN from '../../../dwn';

import { ProtocolsQuery } from '@tbd54566975/dwn-sdk-js';

/**
 * TODO: fill out
 * @param {*} ctx 
 * @param {*} data 
 */
export async function handleProtocolsQuery(ctx, data) {
  const { profile, signatureMaterial } = ctx;

  const protocolsQuery = await ProtocolsQuery.create({
    target         : profile.did,
    signatureInput : signatureMaterial,
    ...data.message
  });

  const protocolsQueryJSON = protocolsQuery.toJSON();
  console.log(protocolsQueryJSON);

  const dwn = await DWN.open();
  const result = await dwn.processMessage(protocolsQueryJSON);

  return result;
}