import * as Block from 'multiformats/block';
import * as cbor from '@ipld/dag-cbor';

import { base58btc } from 'multiformats/bases/base58';
import { Level } from 'level';
import { sha256 } from 'multiformats/hashes/sha2';
import { Temporal } from '@js-temporal/polyfill';

import { DIDKey } from '../src/lib/did-key.js';
import { Encoder } from '../src/encoder.js';

const eventLog = new Level('EVENTLOG');

async function createIdentity() {
  const { did, publicJWK, privateJWK } = await DIDKey.generate();
  const { alg, kid } = publicJWK;

  const signatureMaterial = {
    protectedHeader: { alg, kid },
    privateJwk: privateJWK
  };

  return { did, publicJWK, privateJWK, signatureMaterial }
}

/**
 * Generates a random alpha-numeric string.
 */
function randomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  // pick characters randomly
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  return randomString;
};

/**
 * Generates a random byte array of given length.
 */
function randomBytes(length) {
  const random = randomString(length);
  return new TextEncoder().encode(random);
};

/**
 * The maximum is exclusive and the minimum is inclusive
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
function randomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min) + min);
}

function randomObject() {
  return { [randomString(5)]: randomString(10) }
}

async function hash(prefix) {
  const bytes = Encoder.stringToBytes(prefix);
  const bytesHashed = await sha256.encode(bytes);
  const hashBase58BtcEncoded = base58btc.baseEncode(bytesHashed);

  return hashBase58BtcEncoded;
}

const alice = await createIdentity();
const bob = await createIdentity();

const identities = [alice, bob];

for (let i = 0; i < 30; i += 1) {
  const randomNum = randomInt(0, 101);
  const identity = identities[randomNum % identities.length];

  const tenantHash = await hash(identity.did);
  const key = Temporal.Now.instant().epochNanoseconds.toString();

  const encodedBlock = await Block.encode({ value: randomObject(), codec: cbor, hasher: sha256 });

  const tenantEventLog = eventLog.sublevel(tenantHash)
  await tenantEventLog.put(key, encodedBlock.cid.toString());
}

