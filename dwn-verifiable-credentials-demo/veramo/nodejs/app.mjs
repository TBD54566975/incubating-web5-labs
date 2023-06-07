import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { createAgent } from '@veramo/core'
import { DIDManager } from '@veramo/did-manager'
import { WebDIDProvider } from '@veramo/did-provider-web'
import { KeyDIDProvider } from '@veramo/did-provider-key'
import { KeyManager } from '@veramo/key-manager'
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local'
import { CredentialPlugin } from '@veramo/credential-w3c'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Entities, KeyStore, DIDStore, PrivateKeyStore, migrations } from '@veramo/data-store'

import { Resolver } from 'did-resolver'
import { getResolver as webDidResolver } from 'web-did-resolver'
import { getResolver as keyDidResolver } from 'key-did-resolver'

import { DataSource } from 'typeorm'
import { promises as fs } from 'fs';

const KMS_SECRET_KEY = '11b574d316903ced6cc3f4787bbcc3047d9c72d1da4d83e36fe714ef785d10c1'
const DATABASE_FILE = 'database.sqlite'

let agent;
let identifier;

async function init() {
  try {
    await fs.unlink('./' + DATABASE_FILE);
  } catch (err) {
    console.log("Database file does not exist, continuing...")
  }

  const dbConnection = new DataSource({
    type: 'sqlite',
    database: DATABASE_FILE,
    synchronize: false,
    migrations,
    migrationsRun: true,
    logging: ['error', 'info', 'warn'],
    entities: Entities,
  }).initialize()

  agent = createAgent({
    plugins: [
      new KeyManager({
        store: new KeyStore(dbConnection),
        kms: {
          local: new KeyManagementSystem(new PrivateKeyStore(dbConnection, new SecretBox(KMS_SECRET_KEY))),
        },
      }),
      new DIDManager({
        store: new DIDStore(dbConnection),
        defaultProvider: 'did:key',
        providers: {
          'did:web:mywebsite.com': new WebDIDProvider({
            defaultKms: 'local',
          }),
          'did:key': new KeyDIDProvider({
            defaultKms: 'local',
          }),
        },
      }),
      new DIDResolverPlugin({
        resolver: new Resolver({
          ...webDidResolver(),
          ...keyDidResolver(),
        }),
      }),
      new CredentialPlugin(),
    ],
  })

  identifier = await agent.didManagerCreate({ alias: 'did:key' })
}

init()

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/buy', async (req, res) => {
  const { did } = req.body;
  if (!did) {
    return res.status(400).send({ error: 'DID is required' });
  }

  const verifiableCredential = await agent.createVerifiableCredential({
    credential: {
      issuer: { id: identifier.did },
      credentialSubject: {
        id: did,
        verifiedBuyer: true,
      },
    },
    proofFormat: 'jwt',
  })

  res.send({ success: true, message: verifiableCredential });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
