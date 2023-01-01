import { IdentityStore } from '../db';

/**
 * @typedef {import('../lib/request-router').Handler} Handler
 */

/** @type {Handler} */
export async function createIdentity(request) {
  const { data } = request;
  const { didMethod, name, options } = data;

  // TODO: handle error
  await IdentityStore.create(name, didMethod, options);

  return { status: 201 };
}