import * as ed25519 from '@noble/ed25519';
import * as varint from 'varint';

import { base58btc } from 'multiformats/bases/base58';
import { base64url } from 'multiformats/bases/base64';
import { Dwn, CollectionsWrite, CollectionsQuery, ProtocolsConfigure } from "@tbd54566975/dwn-sdk-js";

const dwn = await Dwn.create({});

const alice = await createIdentity();
const bob = await createIdentity();
const carlos = await createIdentity();

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

// multicodec code for Ed25519 keys
const ED25519_CODEC_ID = varint.encode(parseInt('0xed', 16));

/**
 * @typedef {Object} GenerateDIDResult
 * @property {string} did - the generated DID
 * @property {PublicJWK} publicJWK - the public key of the private key that was used to generate the DID
 * @property {PrivateJWK} privateJWK - the private key used to generate the DID
 */

/**
 * * [DID Spec Doc](https://www.w3.org/TR/did-core/)
 * * [DID-Key Spec Draft](https://w3c-ccg.github.io/did-method-key/)
 */
export class DIDKey {
  /**
   * generates a new ed25519 public/private keypair. Creates a DID using the private key
   * @return {GenerateDIDResult} did, public key, private key
   */
  static async generate() {
    const privateKeyBytes = ed25519.utils.randomPrivateKey();
    const publicKeyBytes = await ed25519.getPublicKey(privateKeyBytes);

    const idBytes = new Uint8Array(publicKeyBytes.byteLength + ED25519_CODEC_ID.length);
    idBytes.set(ED25519_CODEC_ID, 0);
    idBytes.set(publicKeyBytes, ED25519_CODEC_ID.length);

    const id = base58btc.encode(idBytes);
    const did = `did:key:${id}`;
    const keyId = `${did}#${id}`;

    // TODO: `publicJWK` code is duplicated in resolve. move JWK creation into a separate method (Moe - 08/01/2022)
    const publicJWK = {
      alg: 'EdDSA',
      crv: 'Ed25519',
      kid: keyId,
      kty: 'OKP',
      use: 'sig',
      x: base64url.baseEncode(publicKeyBytes)
    };

    const privateJWK = { ...publicJWK, d: base64url.baseEncode(privateKeyBytes) };

    return { did, publicJWK, privateJWK };
  }

  static resolve(did) {
    const [scheme, method, id] = did.split(':');

    if (scheme !== 'did') {
      throw new Error('malformed scheme');
    }

    if (method !== 'key') {
      throw new Error('did method MUST be "key"');
    }

    const idBytes = base58btc.decode(id);
    const publicKeyBytes = idBytes.slice(ED25519_CODEC_ID.length);

    const publicJwk = {
      alg: 'EdDSA',
      crv: 'Ed25519',
      kty: 'OKP',
      use: 'sig',
      x: base64url.baseEncode(publicKeyBytes)
    };

    const keyId = `${did}#${id}`;

    const didDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1',
        'https://w3id.org/security/suites/x25519-2020/v1'
      ],
      'id': did,
      'verificationMethod': [{
        id: keyId,
        type: 'JsonWebKey2020',
        controller: did,
        publicKeyJwk: publicJwk
      }],
      'authentication': [keyId],
      'assertionMethod': [keyId],
      'capabilityDelegation': [keyId],
      'capabilityInvocation': [keyId]
    };

    return didDocument;
  }
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