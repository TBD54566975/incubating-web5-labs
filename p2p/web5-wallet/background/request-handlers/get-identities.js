import { IdentityStore } from '../db';

/**
 * @typedef {import('../lib/request-router').Handler} Handler
 */

/** @type {Handler} */
export async function getIdentities(_request) {
  const identities = await IdentityStore.getAllIdentities();

  return { data: identities };
}