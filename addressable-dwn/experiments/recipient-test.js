import { RecordsWrite, RecordsQuery, ProtocolsConfigure, Dwn } from '@tbd54566975/dwn-sdk-js';
import { randomBytes, createProfile } from '../utils.js';
import chalk from 'chalk';

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
            "recipient": {
              "of": "thread",
              "to": ["write"]
            }
          }
        }
      }
    }
  }
};

const alice = await createProfile('key');
const aliceLabel = chalk.bold.underline.cyan('alice');

const bob = await createProfile('key');
const bobLabel = chalk.bold.underline.magenta('bob');

const dwn = await Dwn.create({});

const aliceCreateProtocol = await createProtocol(alice, protocolName, protocolDefinition);
let result = await dwn.processMessage(aliceCreateProtocol.toJSON());
console.log(`${aliceLabel} (${aliceLabel} dwn) install chat result:`, result);

const bobCreateProtocol = await createProtocol(bob, protocolName, protocolDefinition);
result = await dwn.processMessage(bobCreateProtocol.toJSON());
console.log(`${bobLabel} (${bobLabel} dwn) install chat result:`, result);

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
const bobToAliceCreateThreadForBobDwn = await RecordsWrite.create({
  ...threadInput,
  target: bob.did,
});

console.log(`${bobLabel} -> ${aliceLabel} (${bobLabel} dwn) chat/thread`, JSON.stringify(bobToAliceCreateThreadForBobDwn.toJSON(), null, 4));

result = await dwn.processMessage(bobToAliceCreateThreadForBobDwn.toJSON());
console.log(`${bobLabel} -> ${aliceLabel} (${bobLabel} dwn) chat/thread result:`, result);

// bob sending that thread creation to alice's DWN
const bobToAliceCreateThreadForAliceDwn = await RecordsWrite.create({
  ...threadInput,
  target: alice.did,
  dateCreated: bobToAliceCreateThreadForBobDwn.message.descriptor.dateCreated,
  dateModified: bobToAliceCreateThreadForBobDwn.message.descriptor.dateModified
});

console.log(`${bobLabel} -> ${aliceLabel} (${aliceLabel} dwn) chat/thread`, JSON.stringify(bobToAliceCreateThreadForAliceDwn.toJSON(), null, 4));

result = await dwn.processMessage(bobToAliceCreateThreadForAliceDwn.toJSON());
console.log(`${bobLabel} -> ${aliceLabel} (${aliceLabel} dwn) chat/thread result:`, result);

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
const bobToAliceCreateMessageForBobDwn = await RecordsWrite.create({
  ...messageInput,
  target: bob.did,
});

console.log(`${bobLabel} -> ${aliceLabel} (${bobLabel} dwn) chat/message`, JSON.stringify(bobToAliceCreateMessageForBobDwn.toJSON(), null, 4));

result = await dwn.processMessage(bobToAliceCreateMessageForBobDwn.toJSON());
console.log(`${bobLabel} -> ${aliceLabel} (${bobLabel} dwn) chat/message result:`, result);

// bob sending that message to ${aliceLabel} dwn
const bobToAliceCreateMessageForAliceDwn = await RecordsWrite.create({
  ...messageInput,
  target: alice.did,
  dateCreated: bobToAliceCreateMessageForBobDwn.message.descriptor.dateCreated,
  dateModified: bobToAliceCreateMessageForBobDwn.message.descriptor.dateModified
});

console.log(`${bobLabel} -> ${aliceLabel} (${aliceLabel} dwn) chat/message`, JSON.stringify(bobToAliceCreateMessageForAliceDwn.toJSON(), null, 4));

result = await dwn.processMessage(bobToAliceCreateMessageForAliceDwn.toJSON());
console.log(`${bobLabel} -> ${aliceLabel} (${aliceLabel} dwn) chat/message result:`, result);

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
const aliceToBobCreateMessageForAliceDwn = await RecordsWrite.create({
  ...replyInput,
  target: alice.did,
});

console.log(`${aliceLabel} -> ${bobLabel} (${aliceLabel} dwn) chat/message`, JSON.stringify(aliceToBobCreateMessageForAliceDwn.toJSON(), null, 4));

result = await dwn.processMessage(aliceToBobCreateMessageForAliceDwn.toJSON());
console.log(`${aliceLabel} -> ${bobLabel} (${aliceLabel} dwn) chat/message result:`, result);

// alice sending that reply to bob dwn
const aliceToBobCreateMessageForBobDwn = await RecordsWrite.create({
  ...replyInput,
  target: bob.did,
  dateCreated: aliceToBobCreateMessageForAliceDwn.message.descriptor.dateCreated,
  dateModified: aliceToBobCreateMessageForAliceDwn.message.descriptor.dateModified
});

console.log(`${aliceLabel} -> ${bobLabel} (${bobLabel} dwn) chat/message:`, JSON.stringify(aliceToBobCreateMessageForBobDwn.toJSON(), null, 4));

result = await dwn.processMessage(aliceToBobCreateMessageForBobDwn.toJSON());
console.log(`${aliceLabel} -> ${bobLabel} (${bobLabel} dwn) chat/message result:`, result);