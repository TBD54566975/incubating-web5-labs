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
  amount: number,
  expiryDate: string,
}

/*
* I want to buy 1 btc with USD
* I want to sell 1 btc and receive USD
* I want to buy 100 USD worth of btc.
* I want to sell 100 USD woth of btc.

buying BTC with USD == selling USD for BTC
buying USD with BTC == selling BTC for USD
*/


/**
 * offer, rfq and quote discussion
 */

/**
 * Alice is the only one who can send an RFQ
 * Alice is the only one who can receive a Quote
 * 
 * PFI is the only one who can receive an RFQ
 * PFI is the only one who can send a Quote
 * 
 */


// PFI -> Alice

const offer1 = {
  id: '123',
  // (implied directionality) base_counter, btc is base, usd is counter. PFI has BTC, PFI wants USD
  // typically these don't offer directionality in exchanges, but we want to enforce it
  // side implied here is always sell. 
  name: 'BTC_USD', // suggested name of "product", thoughts around naming?
  // side: "BUY",
  // all numbers should be represented as strings to handle precision correctly
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

// i think naming of this should be consistent with offering
// another implication here: Alice is always Buying the first currency (base currency)
// Alice -> PFI
const rfq1 = {
  // does it make sense for Alice to make her own id before she sends in her RFQ to PFI? 
	rfq_id: "1",
  name: "BTC_USD",
	// source_currency: "USD",
	// target_currency: "BTC",
	amount: 10.00, // Alice has $10 USD
	presentation_submission: [ {  }, {  }] // do i include presentation definition in payment instrument now?
}

// PFI -> Alice
// naming for this message type - executequote, order, 
const quote1 = {
	quote_id: "2",
  // or just hand back rfq_id
	rfq: {
		rfq_id: "1",
    name: "BTC_USD",
		// source_currency: "USD",
		// target_currency: "BTC",
		amount: 10.00,
		// excluded?: "presentation_submission": [ { ... }, { ... }]
	},
  expiryTime: "2023-04-14T12:12:12Z",
	target_amount: '0.000383', // PFI says Alice can have this much BTC for $10 USD
  payment_link: ''
}

// quote execution status can be dropped (price changes too much, PFI decides to not honor the quote)