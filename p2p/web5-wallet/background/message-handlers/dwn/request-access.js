import { AccessControlStore } from '../../db';
import { openUserConsentWindow } from '../../utils';

export async function requestAccess(ctx) {
  const { sender } = ctx;
  const permissions = await AccessControlStore.getDomainPermissions(sender.origin);

  if (permissions) {
    return { isAllowed: permissions.isAllowed };
  }

  // show user consent prompt if no permissions exist for domain yet
  const { isAllowed, did } = await openUserConsentWindow('user-consent/dwn-access', { requestingDomain: sender.origin });
  
  await AccessControlStore.createPermission(sender.origin, did, isAllowed);

  return { isAllowed };
}