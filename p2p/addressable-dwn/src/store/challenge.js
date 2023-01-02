import ms from 'ms';
import Keyv from '@keyvhq/core';
import { v4 as uuidv4 } from 'uuid';

// in-memory, by default. can use storage adapter for persistence
const keyv = new Keyv();

keyv.on('error', err => console.log('Connection Error', err));

// TODO: maybe create challenge for specific DID
export async function create() {
  const challenge = uuidv4();

  await keyv.set(challenge, 'true', ms('5m'));

  return challenge;
}

export function has(challenge) {
  return keyv.has(challenge);
}