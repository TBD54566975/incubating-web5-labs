import fs from 'fs';
import path from 'path';
import prompts from 'prompts';

import { fileURLToPath } from 'url';
import { CollectionsWrite } from '@tbd54566975/dwn-sdk-js';
import { resolve } from '@decentralized-identity/ion-tools';

// __filename and __dirname are not defined in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const didState = fs.readFileSync(`${__dirname}/did-state.json`, { encoding: 'utf8' });
const bob = JSON.parse(didState);

const questions = [{
  type: 'text',
  name: 'recipient',
  message: 'who do you want to message (must be an ION DID)?'
}, {
  type: 'text',
  name: 'messageText',
  message: 'What do you want to say?'
}];


const { recipient, messageText } = await prompts(questions, { onCancel: () => process.exit(0) });
let dwnHosts = [];

try {
  const { didDocument } = await resolve(recipient);

  const { service = [] } = didDocument;

  for (const svc of service) {
    if (svc.type === 'DecentralizedWebNode') {
      dwnHosts = svc.serviceEndpoint.nodes;
      break;
    }
  }

  if (dwnHosts.length === 0) {
    console.error(`recipient does not have any DWNs listed in their DID Document`);
    console.error(JSON.stringify(didDocument, null, 2));
    process.exit(1);
  }
} catch (error) {
  console.error(`Failed to resolve recipient DID: ${recipient}. Error: ${error.message}`);
  process.exit(1);
}


const directMessage = {
  text: messageText
};

const encoder = new TextEncoder();

const directMessageStringified = JSON.stringify(directMessage);
const directMessageBytes = encoder.encode(directMessageStringified);

const message = await CollectionsWrite.create({
  data: directMessageBytes,
  dataFormat: 'application/json',
  recipient,
  schema: 'http://localhost:3000/schemas/direct-message.json',
  signatureInput: bob.signatureMaterial,
});

try {
  // TODO: handle multiple dwn hosts. send to all? send to at least 1 successfully?
  const [dwnHost] = dwnHosts;

  const sendResult = await fetch(dwnHost, {
    method: 'POST',
    body: JSON.stringify(message)
  });

  console.log(`message sent! result: ${JSON.stringify(sendResult, null, 4)}`);
} catch (error) {
  console.error(`Failed to send message to recipient. Error: ${error.message}`);
  process.exit(1);
}
