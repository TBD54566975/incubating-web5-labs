import type { Offering, RFQ, Quote } from './common.js';

import { protocolDefinition } from './protocol.js';
import { Web5 } from '@tbd54566975/web5';

// Fetch & render offerings from PFI
const { web5, did } = await Web5.connect();


await configureProtocol(protocolDefinition);

const offeringForm = document.querySelector('#get-offering-form');
offeringForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await getOfferingsFromPFI();
})

const rfqForm = document.querySelector('#send-rfq-form');

async function getPfiDid() {
  const pfiDidInput: HTMLInputElement = document.querySelector('#pfi-did')
  const pfiDid = pfiDidInput.value
  return pfiDid
}

async function getOfferingsFromPFI() {
  const pfiDid = await getPfiDid()
  const { records, status } = await web5.dwn.records.query({
    from: pfiDid,
    message: {
      filter: {
        schema: 'https://tbdex.io/schemas/offering'
      }
    }
  });

  if (status.code !== 200) {
    alert('life is hard');
  }

  const mainUL = document.createElement('fieldset')

  for (let record of records) {
    const offering: Offering = await record.data.json();
    const box = document.createElement('fieldset')
    const title = document.createElement('legend')
    title.innerHTML = 'Offering'
    const offeringElement = document.createElement('pre')
    offeringElement.innerHTML = JSON.stringify(offering, null, 4);    
    box.appendChild(title)
    box.appendChild(offeringElement)
    mainUL.appendChild(box)
  }
  document.body.appendChild(mainUL);
  document.querySelector('#offering')
  
}

rfqForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await sendRFQ();
});

async function sendRFQ() {
  const pfiDid = await getPfiDid()
  const rfq: RFQ = {
    offering_id: '123',
    product: 'BTC_USD',
    size: 100,
    presentation_submission: {}
  };
  const { record, status } = await web5.dwn.records.write({
    data: rfq,
    message: {
      protocol: protocolDefinition.protocol,
      protocolPath: 'RFQ',
      schema: 'https://tbd.website/protocols/tbdex/RequestForQuote',
      recipient: pfiDid
    }
  });

  if (status.code !== 202) {
    alert('failed to write RFQ to local. will not send to PFI :/ ' + status.code + ' ' + status.detail);
    return;
  }

  // send is a separate step to actually push the record to a third party DWN
  // in this case, the third party DWN is the PFI DWN.
  await record.send(pfiDid);
  console.log('Sent static RFQ to PFI!')

}

function fetchQuote() {
  throw new Error('Function not implemented.');
}


export async function configureProtocol(protocolDefinition) {
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

