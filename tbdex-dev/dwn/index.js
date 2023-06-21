import {Dwn, RecordsWrite, RecordsQuery} from '@tbd54566975/dwn-sdk-js'
import {ALICE_DID, ALICE_SIG, BOB_DID, BOB_SIG} from './identity.js'

const dwn = await Dwn.create()

const write = async (did, sig) => {
  const data = Buffer.from(JSON.stringify({hello: 'world'}), 'utf-8');
  const intent = await RecordsWrite.create({
    published: true,
    data,
    dataFormat: 'application/json',
    authorizationSignatureInput: sig
  });
  const reply = await dwn.processMessage(did, intent.message, data)
  console.log('RecordsWrite reply', reply)
  return intent.message.recordId
}

const query = async (recordId, did, sig) => {
  const intent = await RecordsQuery.create({
    authorizationSignatureInput: sig,
    filter: {
      recordId
    }
  })
  const reply = await dwn.processMessage(did, intent.message)
  console.log('RecordsQuery reply', reply)
}

// alice
const recordId = await write(ALICE_DID, ALICE_SIG)
console.log('recordId:', recordId)
await query(recordId, ALICE_DID, ALICE_SIG)

// bob
await query(recordId, BOB_DID, BOB_SIG)
