import { CollectionsWrite, ProtocolsConfigure, Dwn } from '@tbd54566975/dwn-sdk-js';
import { MessageStore } from 'message-store-level-v2';
import { randomBytes, createProfile } from '../bob/utils.js';

async function createProtocol(profile, name, definition) {
  return await ProtocolsConfigure.create({
    protocol: name,
    target: profile.did,
    signatureInput: profile.signatureMaterial,
    definition,
  });
}

const protocolName = 'chat';
const protocolDefinition = {
  "labels": {
    "thread": {
      "schema": "chat/thread"
    },
    "message": {
      "schema": "chat/message"
    }
  },
  "records": {
    "thread": {
      "allow": {
        "anyone": {
          "to": ["write"]
        }
      },
      "records": {
        "message": {
          "allow": {
            "anyone": {
              "of": "thread",
              "to": ["write"]
            }
          }
        }
      }
    }
  }
};

const alice = await createProfile();
const bob = await createProfile();

const messageStore = new MessageStore();
const dwn = await Dwn.create({ messageStore });

const aliceCreateProtocol = await createProtocol(alice, protocolName, protocolDefinition);
let result = await dwn.processMessage(aliceCreateProtocol.toJSON());
console.log('alice protocols create result:', result);

const bobCreateProtocol = await createProtocol(bob, protocolName, protocolDefinition);
result = await dwn.processMessage(bobCreateProtocol.toJSON());
console.log('bob protocols create result:', result);

const threadInput = {
  data: randomBytes(10),
  protocol: protocolName,
  dataFormat: 'application/json',
  recipient: alice.did,
  protocol: 'chat',
  schema: 'chat/thread',
  signatureInput: bob.signatureMaterial,
};

// bob creating a thread with alice and storing it in his own DWN first
const bobToAliceCreateThreadForBobDwn = await CollectionsWrite.create({
  ...threadInput,
  target: bob.did,
});

result = await dwn.processMessage(bobToAliceCreateThreadForBobDwn.toJSON());
console.log('bob -> alice (bob dwn) thread create result:', result);

// bob sending that thread creation to alice's DWN
const bobToAliceCreateThreadForAliceDwn = await CollectionsWrite.create({
  ...threadInput,
  target: alice.did,
  dateCreated: bobToAliceCreateThreadForBobDwn.message.descriptor.dateCreated,
});

result = await dwn.processMessage(bobToAliceCreateThreadForAliceDwn.toJSON());
console.log('bob -> alice (alice dwn) thread create result:', result);

const messageInput = {
  data: randomBytes(10),
  protocol: protocolName,
  dataFormat: 'application/json',
  recipient: alice.did,
  protocol: 'chat',
  schema: 'chat/message',
  contextId: bobToAliceCreateThreadForBobDwn.message.contextId,
  parentId: bobToAliceCreateThreadForBobDwn.message.recordId,
  signatureInput: bob.signatureMaterial,
};

// bob creating a message to send to alice and storing it in his dwn
const bobToAliceCreateMessageForBobDwn = await CollectionsWrite.create({
  ...messageInput,
  target: bob.did,
});

result = await dwn.processMessage(bobToAliceCreateMessageForBobDwn.toJSON());
console.log('bob -> alice (bob dwn) message create result:', result);

// bob sending that message to alice dwn
const bobToAliceCreateMessageForAliceDwn = await CollectionsWrite.create({
  ...messageInput,
  target: alice.did,
  dateCreated: bobToAliceCreateMessageForBobDwn.message.descriptor.dateCreated,
});

result = await dwn.processMessage(bobToAliceCreateMessageForAliceDwn.toJSON());
console.log('bob -> alice (alice dwn) message create result:', result);

const replyInput = {
  data: randomBytes(10),
  protocol: protocolName,
  dataFormat: 'application/json',
  recipient: bob.did,
  protocol: 'chat',
  schema: 'chat/message',
  contextId: bobToAliceCreateThreadForBobDwn.message.contextId,
  parentId: bobToAliceCreateThreadForBobDwn.message.recordId,
  signatureInput: alice.signatureMaterial,
};

// alice creating a reply message to send to bob and storing it in her dwn
const aliceToBobCreateMessageForAliceDwn = await CollectionsWrite.create({
  ...replyInput,
  target: alice.did,
});

result = await dwn.processMessage(aliceToBobCreateMessageForAliceDwn.toJSON());
console.log('alice -> bob (alice dwn) message create result:', result);

// alice sending that reply to bob dwn
const aliceToBobCreateMessageForBobDwn = await CollectionsWrite.create({
  ...replyInput,
  target: bob.did,
  dateCreated: aliceToBobCreateMessageForAliceDwn.message.descriptor.dateCreated,
});

result = await dwn.processMessage(aliceToBobCreateMessageForBobDwn.toJSON());
console.log('alice -> bob (bob dwn) message create result:', result);