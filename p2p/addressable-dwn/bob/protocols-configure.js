import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { ProtocolsConfigure } from '@tbd54566975/dwn-sdk-js';
import { dwn } from '../src/dwn.js';

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
        "schema": "https://identity.foundation/protocols/chat/thread"
      },
      "message": {
        "schema": "https://identity.foundation/protocols/chat/message"
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
                "to": ["write"]
              }
            }
          }
        }
      }
    }
  }
});

console.log(JSON.stringify(message.toJSON(), null, 2));

const result = await dwn.processMessage(message.toJSON());
console.log(result);