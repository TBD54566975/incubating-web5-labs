import { Dwn, CollectionsWrite, CollectionsQuery, ProtocolsConfigure } from "@tbd54566975/dwn-sdk-js";
import { MessageStoreLevelv2 as MessageStore } from "../src/message-store-level-v2.js";
import { DIDKey } from '../src/lib/did-key.js';

// const messageStore = new MessageStore({
//   blockstoreLocation: 'BS',
//   indexLocation: 'INTHEX',
//   eventLogLocation: 'EVT',
// });

// const dwn = await Dwn.create({ messageStore });

const dwn = await Dwn.create({});

const alice = await createIdentity();
const bob = await createIdentity();
const carlos = await createIdentity();

// const identities = [alice, bob];

const protocolsConfigureMessage = await ProtocolsConfigure.create({
  target: alice.did,
  protocol: 'chat',
  definition: {
    'labels': {
      'thread': {
        'schema': 'chat/thread'
      },
      'message': {
        'schema': 'chat/message'
      }
    },
    'records': {
      'thread': {
        'allow': {
          'anyone': {
            'to': [
              'write'
            ]
          }
        },
        'records': {
          'message': {
            'allow': {
              'anyone': {
                'of': 'thread',
                'to': [
                  'write'
                ]
              }
            }
          }
        }
      }
    }
  },
  signatureInput: alice.signatureMaterial
});

let result = await dwn.processMessage(protocolsConfigureMessage.toJSON());
console.log(result);

const encoder = new TextEncoder();

const thread = { subject: 'shimmy' };
const threadStringified = JSON.stringify(thread);
const threadBytes = encoder.encode(threadStringified);

const threadMessage = await CollectionsWrite.create({
  data: threadBytes,
  dataFormat: 'application/json',
  recipient: alice.did,
  target: alice.did,
  protocol: 'chat',
  schema: 'chat/thread',
  signatureInput: bob.signatureMaterial,
});

result = await dwn.processMessage(threadMessage.toJSON());
console.log(result);

const directMessage = { text: 'poopoo' };
const directMessageStringified = JSON.stringify(directMessage);
const directMessageBytes = encoder.encode(directMessageStringified);

// oof. yikes variable name.
const directMessageMessage = await CollectionsWrite.create({
  data: directMessageBytes,
  dataFormat: 'application/json',
  recipient: alice.did,
  target: alice.did,
  protocol: 'chat',
  contextId: threadMessage.message.contextId,
  parentId: threadMessage.message.recordId,
  schema: 'chat/message',
  signatureInput: bob.signatureMaterial,
});

result = await dwn.processMessage(directMessageMessage.toJSON());
console.log(result);

const yikes = { text: 'poopoo' };
const yikesStringified = JSON.stringify(yikes);
const yikesBytes = encoder.encode(yikesStringified);

const yikesDM = await CollectionsWrite.create({
  data: yikesBytes,
  dataFormat: 'application/json',
  recipient: alice.did,
  target: alice.did,
  protocol: 'chat',
  contextId: threadMessage.message.contextId,
  parentId: threadMessage.message.recordId,
  schema: 'chat/message',
  signatureInput: carlos.signatureMaterial,
});

result = await dwn.processMessage(yikesDM.toJSON());
console.log(result);

const threadsQuery = await CollectionsQuery.create({
  target: alice.did,
  signatureInput: alice.signatureMaterial,
  filter: {
    protocol: 'chat',
    schema: 'chat/thread'
  }
});

const messages = await messageStore.getEventLog(bob.did);
console.log(messages);

result = await dwn.processMessage(threadsQuery.toJSON());

for (let entry of result.entries) {
  const chatQuery = await CollectionsQuery.create({
    target: alice.did,
    signatureInput: alice.signatureMaterial,
    filter: {
      protocol: 'chat',
      schema: 'chat/message',
      contextId: entry.contextId
    },
    dateSort: 'createdAscending'
  });

  console.log(chatQuery.toJSON());

  const result = await dwn.processMessage(chatQuery.toJSON());
  console.log(result);
}

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