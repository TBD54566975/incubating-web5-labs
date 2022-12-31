import { IdentityStore } from '../db';

export async function getIdentities(_request) {
  return await IdentityStore.getAllIdentities();
}