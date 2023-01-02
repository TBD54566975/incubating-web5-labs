import { Dwn, CollectionsWrite } from '@tbd54566975/dwn-sdk-js';
import { MessageStoreLevelv2 } from '../src/message-store-level-v2.js';
import { DIDKey } from '../src/lib/did-key.js';

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

const alice = await createIdentity();
const bob = await createIdentity();

const identities = [alice, bob];

const messageStore = new MessageStoreLevelv2();
const dwn = await Dwn.create({ messageStore });

for (let i = 0; i < 30; i += 1) {
  const randomNum = randomInt(0, 101);
  const identity = identities[randomNum % identities.length];

  const message = await CollectionsWrite.create({
    target: identity.did,
    recipient: identity.did,
    schema: 'https://schemas.org/todo',
    data: randomBytes(100),
    dataFormat: 'application/json',
    signatureInput: identity.signatureMaterial
  });

  const result = await dwn.processMessage(message.toJSON());
  console.log(JSON.stringify(result, null, 2));
}

const aliceEventLog = await messageStore.getEventLog(alice.did);
console.log('--------------- ALICE EVENT LOG ---------------');
console.log(aliceEventLog);

for (let i = 1; i < aliceEventLog.length; i += 1) {
  const watermark = BigInt(aliceEventLog[i].watermark);
  const prevWatermark = BigInt(aliceEventLog[i - 1].watermark);

  console.log(watermark > prevWatermark);
}

const bobEventLog = await messageStore.getEventLog(bob.did);
console.log('--------------- BOB EVENT LOG ---------------');
console.log(bobEventLog);

for (let i = 1; i < bobEventLog.length; i += 1) {
  const watermark = BigInt(bobEventLog[i].watermark);
  const prevWatermark = BigInt(bobEventLog[i - 1].watermark);

  console.log(watermark > prevWatermark);
}


