import { PermissionStore, IdentityStore } from '../../../db';
import { handleCollectionsQuery } from './collections-query';
import { handleCollectionsWrite } from './collections-write';
import { handleProtocolsConfigure } from './protocols-configure';

const dwnMethodHandlers = {
  'CollectionsQuery'   : handleCollectionsQuery,
  'CollectionsWrite'   : handleCollectionsWrite,
  'ProtocolsConfigure' : handleProtocolsConfigure
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

  ctx.identity = await IdentityStore.getByDID(permissions.did);
  ctx.signatureMaterial = await IdentityStore.getDWNSignatureMaterial(ctx.identity);

  return dwnMethodHandler(ctx, data);
}