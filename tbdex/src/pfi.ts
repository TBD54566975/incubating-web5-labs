import type { Offering, RFQ } from './common.js';
import { pfiProtocolDefinition } from './protocol.js';
import { Web5 } from '@tbd54566975/web5';

const { web5, did } = await Web5.connect();

// TODO: find a no-creds public api to get USD/BTC fx rate

// console.log('pfi did', did);

// await configureProtocol(pfiProtocolDefinition);
// await loadOfferings();

const copyDidElement = document.querySelector('#copy-did');
const copyIndicator = document.querySelector('#copy-indicator') as HTMLElement;

copyDidElement.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(did);
    copyIndicator.style.display = 'block';

    setTimeout(() => {
      copyIndicator.style.display = 'none';
    }, 2000);

  } catch (err) {
    alert('Failed to copy DID. check console for error');
    console.error(err);
  }
});


async function loadOfferings() {
  const offer: Offering = {
    id                      : '123',
    name                    : 'BTC_USD',
    unitPrice               : 27000,
    fee                     : 5,
    min                     : 10,
    max                     : 100,
    presentation_definition : {},
    payment_instruments     : [{
      kind                    : 'DEBIT_CARD',
      fee                     : 1,
      presentation_definition : {},
    }]
  };

  const { record, status } = await web5.dwn.records.write({
    data    : offer,
    message : {
      published : true,
      schema    : 'tbdex.io/schemas/offering'
    }
  });

  console.log('offering written', record);
  console.log('dwn write status', status);
}

const rfqForm = document.querySelector('#receive-rfq-form');

rfqForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await fetchRFQ();
});

async function fetchRFQ() {
  const { records, status } = await web5.dwn.records.query({
    message: {
      filter: {
        protocol : 'https://tbd.website/protocols/tbdex',
        schema   : 'https://tbd.website/protocols/tbdex/RequestForQuote'
      }
    }
  });

  for (let record of records) {
    const rfq: RFQ = await record.data.json();
    alert('got an RFQ from Alice ' + JSON.stringify(rfq));
  }
}

function writeQuote() {
  throw new Error('Function not implemented.');
}

function sendQuoteToAlice() {
  throw new Error('Function not implemented.');
}

async function configureProtocol(protocolDefinition) {
  const { protocols, status } = await web5.dwn.protocols.query({
    message: {
      filter: {
        protocol: 'https://tbd.website/protocols/tbdex'
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
    console.log('protocol already exists');
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