export type Offering = {
  id: string;
  /** what are we trading? format: whatwesell_whatwebuy ?  */
  pair: string;
  /** how much buying currency we'd have to receive in order to give away a unit of selling currency*/
  unitPrice: string;
  fee: string;
  min?: string;
  max?: string;
  /** what presentation definition Alice need to submit with her RFQ */
  payinInstruments: PaymentInstrument[];
  payoutInstruments: PaymentInstrument[];
  presentationRequest: object;
};

export type PaymentInstrument = {
  kind: string;
  fee?: string;
  presentationRequest?: object;
}


export type RFQ = {
  offering_id: string,
  product: string,
  size: number,
  presentation_submission: object
}

export type Quote = {
  rfq: RFQ,
  amount: number,
  expiryDate: string,
}