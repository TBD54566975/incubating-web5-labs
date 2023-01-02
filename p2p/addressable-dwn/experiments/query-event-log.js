import PouchDB from 'pouchdb';
import pouchFind from 'pouchdb-find';

import { MessageStorePouch } from '../src/message-store.js';

PouchDB.plugin(pouchFind);

const eventLog = new PouchDB('message-event-log');

const result = await eventLog.allDocs({
  include_docs: true
});

const targetHashes = new Set([]);

for (let row of result.rows) {
  console.log(row);
  console.log(row.id, row.doc.dateCreated);
  targetHashes.add(row.doc.targetHashed);
}

for (let targetHashed of targetHashes) {
  const { docs } = await eventLog.find({
    selector: { targetHashed },
    limit: 1
  });

  const startKey = docs[0]._id;

  const { rows: targetEvents } = await eventLog.allDocs({
    include_docs: true,
    startkey: startKey,
    endkey: MessageStorePouch.generateID(targetHashed)
  });

  console.log(`--------------- TARGET EVENTS FOR ${targetHashed} ---------------`);
  for (let event of targetEvents) {
    console.log(event.id);
  }
}