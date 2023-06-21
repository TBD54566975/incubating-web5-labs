import {DwnProxy} from '../../../dwn-proxy-js/dist/esm/main.mjs'
import {protocolDefinition} from '../tbdex-protocol.js'
import {DID, SIG} from './identity.js'
import {DID as ALICE_DID} from '../alice/identity.js'

const app = new DwnProxy();

app.dwn.records.query(
  async message => {
    console.log('RecordsQuery handler', message)
  }
)

app.dwn.records.write(
  async (message, data) => {
    console.log('RecordsWrite handler', message, data)
  }
)

app.post('/offer', async req => {
  console.log('Offer req received!', req.url);
  return {
    data: {
      some: 'offer data and stuff'
    }
  }
})

app.post('/quote', async req => {
  console.log('Quote req received!', req.url)

  return {
    target: ALICE_DID,
    descriptors: {
      protocol: protocolDefinition.protocol,
      protocolPath: 'RFQ/Quote',
      schema: 'https://tbd.website/protocols/tbdex/Quote',
      recipient: ALICE_DID,
      // contextId: lastRFQRecord.contextId,
      // parentId: lastRFQRecord.id
      contextId: 'bafyreiabuamfcygs7d4i2yp3ij5zzrhkpp56wmtbg52ynkqau3qnoruj54',
      parentId: 'bafyreiabuamfcygs7d4i2yp3ij5zzrhkpp56wmtbg52ynkqau3qnoruj54'
    },
    data: {
      some: 'quote data and stuff'
    }
  }
})

app.dwn.protocols.configure(protocolDefinition)

const PORT = 8080;
const DID_STATE = {
  id: DID,
  signatureInput: SIG
}
await app.listen(PORT, {didState: DID_STATE});
