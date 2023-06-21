import {DwnProxy} from '../../dwn-proxy-js/dist/esm/main.mjs'
import {protocolDefinition} from '../tbdex-protocol.js'

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

app.dwn.protocols.configure(protocolDefinition)

const PORT = 8080;
await app.listen(PORT);
