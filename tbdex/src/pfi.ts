import type { Offering } from './common.js';

import { Web5 } from '@tbd54566975/web5';

const { web5, did } = await Web5.connect();

// TODO: figure out what an offering contains
// TODO: find a no-creds public api to get USD/BTC fx rate

console.log('pfi did', did)

const offer: Offering = {
  id: '123',
  name: 'BTC_USD', // base_counter, btc is base, usd is counter. PFI has BTC, PFI wants USD
  unitPrice: 27000, // how much counter currency you need to buy 1 unit of base currency
  fee: 5,
  min: 10,
  max: 100,
  // does the presentation definition spec allow us to receive them split like this and then "smush" them together?
  presentation_definition: {},
  payment_instruments: [{
    kind: 'DEBIT_CARD',
    fee: 1,
    presentation_definition: {},
  }]
};

const { record, status } = await web5.dwn.records.write({
    data: offer,
    message: {
        published: true,
        schema: 'tbdex.io/schemas/offering'
    }
})

console.log('offering written', record)
console.log('just the offer', await record.data.text())
console.log('dwn write status', status)

async function loadOfferings() {

}