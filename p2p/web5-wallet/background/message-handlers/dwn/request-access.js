import { PermissionStore, IdentityStore } from '../../db';
import { openUserConsentWindow } from '../../utils';

export async function requestAccess(ctx) {
  const { sender } = ctx;
  const permissions = await PermissionStore.getDomainPermissions(sender.origin);

  if (permissions) {
    const { isAllowed } = permissions;

    if (isAllowed) {
      // TODO: store identity instead of did in PermissionStore
      const identity = await IdentityStore.getByDID(permissions.did);
      return { did: permissions.did, isAllowed, name: identity.name };
    } else {
      return { isAllowed };
    }
  }

  // show user consent prompt if no permissions exist for domain yet
  const { isAllowed, did } = await openUserConsentWindow('user-consent/dwn-access', { requestingDomain: sender.origin });
  
  await PermissionStore.createPermission(sender.origin, did, isAllowed);

  // TODO: store identity instead of did in PermissionStore
  const identity = await IdentityStore.getByDID(did);

  if (isAllowed) {
    return { did, isAllowed, name: identity.name };
  } else {
    return { isAllowed };
  }
}