import * as DWN from '../../../dwn';

import { ProtocolsConfigure } from '@tbd54566975/dwn-sdk-js';

/**
 * TODO: fill out
 * @param {*} ctx 
 * @param {*} data 
 */
export async function handleProtocolsConfigure(ctx, data) {
  const { profile, signatureMaterial } = ctx;

  const protocolsConfigure = await ProtocolsConfigure.create({
    target         : profile.did,
    signatureInput : signatureMaterial,
    ...data.message
  });

  const protocolsConfigureJSON = protocolsConfigure.toJSON();
  console.log(protocolsConfigureJSON);

  const dwn = await DWN.open();
  const result = await dwn.processMessage(protocolsConfigureJSON);

  return result;
}