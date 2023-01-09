import { ProfileStore } from '../db';

/**
 * @typedef {import('../lib/request-router').Handler} Handler
 */

/** @type {Handler} */
export async function getProfiles(_request) {
  const profiles = await ProfileStore.getAllProfiles();

  return { data: profiles };
}