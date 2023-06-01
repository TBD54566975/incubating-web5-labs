/**
 * dweb message != tbdex message
 * transactionId that starts at rfq and goes all the way to end
 * maybe each object to have their own id? 
 */

// PFI -> Alice
let offer = {
    "id": "123",
    "pair": "BTC_USD", // base_counter (coinmetrics called this base and quote), maybe use pair for name
    "unit_price": 27000.00,
    "fee": 0.00, // fee_estimate
    "min": 10.00,
    "max": 100.00,
    // here's how to present your KYC VC
    "presentation_definition": { ... },
    // we could use debit card token...but that means wallet is creating bespoke payment method just for this PFI
    "payin_instruments": [{
        "kind": "DEBIT_CARD",
        "fee": 1,
        "presentation_definition": {}, // give me your token VC and also give me your age VC
    }, {
        "kind": "CREDIT_CARD",
        "fee": 10,
        "presentation_definition": {}, // give me your token VC and also give me your age VC
    }],
    "payout_instruments": [{
        "kind": "BTC_ADDRESS",
        "fee": 1,
        "presentation_definition": {}
    }, {
        "kind": "SNAIL_MAIL",
        "fee": 100,
        "presentation_definition": {}
    }]
}

// Alice -> PFI
// need a way for RFQ to clearly say "this is the offer and this is how i plan on paying in/out"
let rfq = {
    "pair": "BTC_USD",
    "amount": 10.00,
    // here's my KYC VC that adheres to the top level presentation definition
    // not sending in my payin/payout VCs yet
    "presentation_submission": [{ ... }],
    "payin_instrument": {
        kind: "DEBIT_CARD"
    },
    "payout_instrument": {
        kind: "BTC_ADDRESS"
    }
}

// PFI -> Alice
let quote = {
    "quote_id": "2",
    "rfq_id": "1",
    // "rfq": {
    //     "rfq_id": "1",
    //     "name": "BTC_USD",
    //     "amount": 10.00
    // },
    "expiryTime": "2023-04-14T12:12:12Z",
    "unitPrice": 27121.00,
    "totalFee": 1.00,
    "amount": 0.000383,
    // 2 input descriptors, 1 pay-in, 1 pay-out (alice chose debit card and btc address above, so that's what PFI will ask for here)
    "presentation_definition": { ...}
    // "payment_link": "https://stripe.com/pfi_payment_link" // talked about this to overcome debit card VC issues, but will it work for later? 

}

// how does Alice submit an order and actually pay? 
// Alice -> PFI
let order = {
    "order_id": 32432,
    "quote_id": 2,
    // includes both payin and payout VCs in 1 presentation submission
    "presentation_submission": { ...}
}

// PFI -> Alice
let orderstatus = {
    "quote_id": 2,
    "order_id": 32432,
    "status": 'PENDING'
}

