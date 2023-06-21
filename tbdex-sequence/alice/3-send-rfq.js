import {Web5} from '@tbd54566975/web5'
import {protocolDefinition} from '../tbdex-protocol.js'
import {DID} from '../pfi/identity.js'

const proxyDid = DID

const { web5 } = await Web5.connect()

const result = await web5.dwn.records.write({
  message: {
    protocol: protocolDefinition.protocol,
    protocolPath: 'RFQ',
    schema: 'https://tbd.website/protocols/tbdex/RequestForQuote',
    recipient: DID
  },
  data: {
    some: 'rfq data and stuff'
  }
})
console.log('Result', await result.record.data.json())
const response = await result.record.send(proxyDid)
console.log('Response', response)
