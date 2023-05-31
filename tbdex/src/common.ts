export type PaymentInstrument = {
  kind: string;
  fee?: number; 
  presentation_definition: object;
}

export type Offering = {
  id: string;
  /** what are we trading? format: whatwesell_whatwebuy ?  */
  name: string;
  /** how much buying currency we'd have to receive in order to give away a unit of selling currency*/
  unitPrice: number;
  /** what presentation definition Alice need to submit with her RFQ */
  presentation_definition: object;
  fee: number;
  min?: number;
  max?: number;
  payment_instruments: PaymentInstrument[];
};


// offering from PFI's perspective
const a: Offering = {
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
}


export type RFQ = {
  offering_id: string,
  product: string,
  size: number,
  presentation_submission: object
}

// vcs required may differ based on payment_instrument
// e.g. payment_instrument credit card, may require ID as VC
// RFQ from Alice's perspective
// i have counter currency, i want base currency
const rfq = {
  offering_id: '123',
  product: 'BTC_USD',
  size: 100,
  presentation_submission: {}
}

export type Quote = {
  rfq: RFQ,

}

/*
* I want to buy 1 btc with USD
* I want to sell 1 btc and receive USD
* I want to buy 100 USD worth of btc.
* I want to sell 100 USD woth of btc.

buying BTC with USD == selling USD for BTC
buying USD with BTC == selling BTC for USD
*/