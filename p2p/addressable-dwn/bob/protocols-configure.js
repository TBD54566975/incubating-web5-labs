import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { ProtocolsConfigure } from '@tbd54566975/dwn-sdk-js';

// __filename and __dirname are not defined in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const didState = fs.readFileSync(`${__dirname}/did-state.json`, { encoding: 'utf8' });
const bob = JSON.parse(didState);

const message = await ProtocolsConfigure.create({
  protocol: 'chat',
  target: bob.longFormDID,
  signatureInput: bob.signatureMaterial,
  definition: {
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
  }
});

try {
  const response = await fetch('http://localhost:3000/dwn', {
    method: 'POST',
    body: JSON.stringify(message.toJSON())
  });

  const responseBody = await response.json();

  console.log(`send message result: ${JSON.stringify(responseBody, null, 4)}`);
} catch (error) {
  console.error(`Failed to send message to recipient. Error: ${error.message}`);
  process.exit(1);
}