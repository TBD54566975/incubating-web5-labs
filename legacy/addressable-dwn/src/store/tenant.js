import Keyv from '@keyvhq/core';

// in-memory, by default. can use storage adapter for persistence
const keyv = new Keyv();

keyv.on('error', err => console.log('Connection Error', err));

export async function add(did) {
  return keyv.set(did, 'true');
}

export function disable(did) {
  return keyv.set(did, 'false');
}

export async function isAllowed(did) {
  const isAllowed = await keyv.get(did);

  // will be true or false
  return JSON.parse(isAllowed);
}

export function exists(did) {
  return keyv.has(did);
}