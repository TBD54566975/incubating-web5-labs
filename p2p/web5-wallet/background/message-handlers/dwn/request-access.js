import { PermissionStore, ProfileStore } from '../../db';
import { openUserConsentWindow } from '../../utils';

export async function requestAccess(ctx) {
  const { sender } = ctx;
  const permissions = await PermissionStore.getDomainPermissions(sender.origin);

  if (permissions) {
    const { isAllowed } = permissions;

    if (isAllowed) {
      // TODO: store profile instead of did in PermissionStore
      const profile = await ProfileStore.getByDID(permissions.did);
      return { did: permissions.did, isAllowed, name: profile.name };
    } else {
      return { isAllowed };
    }
  }

  // show user consent prompt if no permissions exist for domain yet
  const { isAllowed, did } = await openUserConsentWindow('user-consent/dwn-access', { requestingDomain: sender.origin });
  
  await PermissionStore.createPermission(sender.origin, did, isAllowed);

  // TODO: store profile instead of did in PermissionStore
  const profile = await ProfileStore.getByDID(did);

  if (isAllowed) {
    return { did, isAllowed, name: profile.name };
  } else {
    return { isAllowed };
  }
}