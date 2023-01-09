import { ProfileStore } from '../db';

/**
 * @typedef {import('../lib/request-router').Handler} Handler
 */

/** @type {Handler} */
export async function createProfile(request) {
  const { data } = request;
  const { didMethod, name, options } = data;

  // TODO: handle error
  await ProfileStore.create(name, didMethod, options);

  return { status: 201 };
}