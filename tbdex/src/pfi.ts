import type { Offering, RFQ, PaymentInstrument, Quote } from './common.js';
import { protocolDefinition } from './protocol.js';
import { Web5 } from '@tbd54566975/web5';

const { web5, did } = await Web5.connect();

await configureProtocol(protocolDefinition);

const addPayInInstrumentButton = document.querySelector('#add-pay-in-instrument');
const addPayOutInstrumentButton = document.querySelector('#add-pay-out-instrument');
const copyDidElement = document.querySelector('#copy-did');
const offeringForm = document.querySelector('#offering-form');
const rfqForm = document.querySelector('#fetch-rfq-form')
const quoteForm = document.querySelector('#create-quote-form')

copyDidElement.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(did);
  } catch (err) {
    alert('Failed to copy DID. check console for error');
    console.error(err);
  }
});

addPayInInstrumentButton.addEventListener('click', e => {
  e.preventDefault();
  addPaymentInstrumentInput('pay-in');
});

addPayOutInstrumentButton.addEventListener('click', e => {
  e.preventDefault();
  addPaymentInstrumentInput('pay-out');
});

offeringForm.addEventListener('submit', async e => {
  e.preventDefault();
  await createOffering();
});

rfqForm.addEventListener('submit', async e => {
  e.preventDefault();
  await fetchRFQs();
});

quoteForm.addEventListener('submit', async e => {
  e.preventDefault();
  await sendQuote();
});


// respond to the latest RFQ with a quote
async function sendQuote() {
  const { records, status: fetchStatus } = await getRFQs();

  const lastRFQRecord = records[records.length - 1]
  const lastRFQ = await lastRFQRecord.data.json()
  
  const rfqAuthor = lastRFQRecord.author
  const quote: Quote = {
    rfq: lastRFQ,
    amount: 0.0142142857,
    expiryDate: new Date().toJSON()
  }

  const { record, status: writeStatus } = await web5.dwn.records.write({
    data: quote,
    message: {
      protocol: 'https://tbd.website/protocols/tbdex',
      protocolPath: 'RFQ/Quote',
      schema: 'https://tbd.website/protocols/tbdex/Quote',
      recipient: rfqAuthor,
      contextId: lastRFQRecord.contextId,
      parentId: lastRFQRecord.id
    }
  })

  if (writeStatus.code !== 202) {
    alert('failed to write Quote to local. will not send to Alice :/ ' + writeStatus.code + ' ' + writeStatus.detail);
    return;
  }

  const { status: sendStatus } = await record.send(rfqAuthor)
  if (sendStatus.code == 202) {
    console.log('Sent Quote ' + JSON.stringify(quote) + ' to Alice!')
  } else {
    alert("omg sending Quote failed: " + JSON.stringify(sendStatus))
  }
}

async function fetchRFQs() {
  const { records, status } = await getRFQs()

  console.log('fetched RFQs', status)

  const mainUL = document.createElement('fieldset')
  for (let record of records) {
    const rfq: RFQ = await record.data.json();
    const box = document.createElement('fieldset')
    const title = document.createElement('legend')
    title.innerHTML = 'RFQ'
    const offeringElement = document.createElement('pre')
    offeringElement.innerHTML = JSON.stringify(rfq, null, 4);
    box.appendChild(title)
    box.appendChild(offeringElement)
    mainUL.appendChild(box)
  }
  document.body.appendChild(mainUL);
}

async function getRFQs() {
  return await web5.dwn.records.query({
    from: did,
    message: {
      filter: {
        schema: 'https://tbd.website/protocols/tbdex/RequestForQuote'
      }
    }
  });
}

function addPaymentInstrumentInput(instrumentType: 'pay-in' | 'pay-out') {
  const containerElement = document.createElement('div');
  containerElement.setAttribute('class', `${instrumentType}-instrument`);

  const instrumentKindContainer = document.createElement('div');

  const instrumentKindLabel = document.createElement('label');
  instrumentKindLabel.innerText = 'Payment Instrument Kind:';

  const instrumentKindInput = document.createElement('input');
  instrumentKindInput.setAttribute('type', 'text');
  instrumentKindInput.setAttribute('class', 'instrument-kind');
  instrumentKindInput.setAttribute('name', 'instrument-kind');

  instrumentKindContainer.appendChild(instrumentKindLabel);
  instrumentKindContainer.appendChild(instrumentKindInput);

  const instrumentFeeContainer = document.createElement('div');

  const instrumentFeeLabel = document.createElement('label');
  instrumentFeeLabel.innerText = 'Payment Instrument Fee:';

  const instrumentFeeInput = document.createElement('input');
  instrumentFeeInput.setAttribute('type', 'number');
  instrumentFeeInput.setAttribute('class', 'instrument-fee');
  instrumentFeeInput.setAttribute('name', 'instrument-fee');

  instrumentFeeContainer.appendChild(instrumentFeeLabel);
  instrumentFeeContainer.appendChild(instrumentFeeInput);

  const row = document.createElement('div');
  row.setAttribute('class', 'form-row');

  row.appendChild(instrumentKindContainer);
  row.appendChild(instrumentFeeContainer);

  const instrumentPresentationDefinitionContainer = document.createElement('div');

  const instrumentPresentationDefinitionLabel = document.createElement('label');
  instrumentPresentationDefinitionLabel.innerText = 'Payment Instrument Presentation Definition:';

  const instrumentPresentationDefinitionInput = document.createElement('textarea');
  instrumentPresentationDefinitionInput.setAttribute('class', 'instrument-presentation-definition');
  instrumentPresentationDefinitionInput.setAttribute('name', 'instrument-presentation-definition');

  instrumentPresentationDefinitionContainer.appendChild(instrumentPresentationDefinitionLabel);
  instrumentPresentationDefinitionContainer.appendChild(instrumentPresentationDefinitionInput);

  containerElement.appendChild(row);
  containerElement.appendChild(instrumentPresentationDefinitionContainer);

  document.querySelector(`#${instrumentType}-instruments`).appendChild(containerElement);
}

async function createOffering() {
  const id: HTMLInputElement = document.querySelector('#offering-id');
  const fee: HTMLInputElement = document.querySelector('#offering-fee');
  const min: HTMLInputElement = document.querySelector('#offering-min');
  const max: HTMLInputElement = document.querySelector('#offering-max');
  const pair: HTMLInputElement = document.querySelector('#offering-pair');
  const unitPrice: HTMLInputElement = document.querySelector('#offering-unit-price');
  const presentationDefinition: HTMLTextAreaElement = document.querySelector('#offering-presentation-definition');

  const payinInstruments = getPaymentInstruments('pay-in');
  const payoutInstruments = getPaymentInstruments('pay-out');

  const offering: Offering = {
    id: id.value,
    pair: pair.value,
    unitPrice: unitPrice.value,
    fee: fee.value,
    min: min.value,
    max: max.value,
    payinInstruments: payinInstruments,
    payoutInstruments: payoutInstruments,
    presentationRequest: JSON.parse(presentationDefinition.value)
  };

  const { status } = await web5.dwn.records.write({
    data: offering,
    message: {
      schema: 'https://tbdex.io/schemas/offering',
      published: true
    }
  });

  if (status.code !== 202) {
    throw new Error(`Failed to create offering. error: ${status}`);
  }
  else { console.log('Offering created!') }

}


function getPaymentInstruments(instrumentType: 'pay-in' | 'pay-out'): PaymentInstrument[] {
  const payInInstrumentDivs = document.querySelectorAll(`.${instrumentType}-instrument`);
  const paymentInstruments: PaymentInstrument[] = [];

  payInInstrumentDivs.forEach((div) => {
    let paymentInstrument: Partial<PaymentInstrument> = {};

    const instrumentKindInput: HTMLInputElement = div.querySelector('.instrument-kind');
    if (instrumentKindInput) {
      paymentInstrument.kind = instrumentKindInput.value;
    }

    const instrumentFeeInput: HTMLInputElement = div.querySelector('.instrument-fee');
    if (instrumentFeeInput) {
      paymentInstrument.fee = instrumentFeeInput.value;
    }

    const presentationDefinitionInput: HTMLInputElement = div.querySelector('.instrument-presentation-definition');
    if (presentationDefinitionInput) {
      paymentInstrument.presentationRequest = JSON.parse(presentationDefinitionInput.value);
    }

    paymentInstruments.push(paymentInstrument as PaymentInstrument);
  });

  return paymentInstruments;
}

async function configureProtocol(protocolDefinition) {
  const { protocols, status } = await web5.dwn.protocols.query({
    message: {
      filter: {
        protocol: protocolDefinition.protocol
      }
    }
  });

  if (status.code !== 200) {
    alert('Failed to query protocols. check console');
    console.error('Failed to query protocols', status);
    return;
  }

  // protocol already exists
  if (protocols.length > 0) {
    console.log('protocol already exists', protocols[0]);
    return;
  }

  // create protocol
  const { status: configureStatus } = await web5.dwn.protocols.configure({
    message: {
      definition: protocolDefinition
    }
  });

  console.log('configure protocol status', configureStatus);
}