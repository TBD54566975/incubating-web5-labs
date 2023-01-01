import { IdentityStore } from '../db';

export async function getIdentities(_request) {
  const identities = await IdentityStore.getAllIdentities();

  return { data: identities };
}