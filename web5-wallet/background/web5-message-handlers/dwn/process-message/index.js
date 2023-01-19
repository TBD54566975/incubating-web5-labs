import { PermissionStore, ProfileStore } from '../../../db';
import { handleRecordsQuery } from './collections-query';
import { handleRecordsWrite } from './collections-write';
import { handleProtocolsConfigure } from './protocols-configure';
import { handleProtocolsQuery } from './protocols-query';

const dwnMethodHandlers = {
  'RecordsQuery'   : handleRecordsQuery,
  'RecordsWrite'   : handleRecordsWrite,
  'ProtocolsConfigure' : handleProtocolsConfigure,
  'ProtocolsQuery'     : handleProtocolsQuery,
};

/**
 * TODO: fill out
 * @param {*} ctx 
 * @param {*} data 
 * @returns 
 */
export async function processMessage(ctx, data) {
  const dwnMethodHandler = dwnMethodHandlers[data.method];

  if (!dwnMethodHandler) {
    throw new Error(`${data.method} not supported.`);
  }
  
  const permissions = await PermissionStore.getDomainPermissions(ctx.sender.origin);

  if (!permissions.isAllowed) {
    return { error: 'Access Forbidden' };
  }

  ctx.profile = await ProfileStore.getByDID(permissions.did);
  ctx.signatureMaterial = await ProfileStore.getDWNSignatureMaterial(ctx.profile);

  return dwnMethodHandler(ctx, data);
}