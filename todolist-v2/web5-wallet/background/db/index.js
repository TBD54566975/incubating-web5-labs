import { createRxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/dexie';

import { AccessControlSchema } from './schemas/access-control';
import { IdentitySchema } from './schemas/identity';

import { AccessControl } from './access-control';
import { Identity } from './identity';

let collections;

export async function open() {
  if (collections) {
    return collections;
  }

  const db = await createRxDatabase({
    name: 'walletdb',
    storage: getRxStorageDexie()
  });

  await db.addCollections({
    accessControl: { schema: AccessControlSchema },
    identities: { schema: IdentitySchema }
  });

  collections = {
    AccessControl: new AccessControl(db.collections.accessControl),
    Identity: new Identity(db.collections.identities),
  };

  return collections;
}