import type { Offering, RFQ, Quote } from './common.js';

import { aliceProtocolDefinition } from './protocol.js';
import { Web5 } from '@tbd54566975/web5';

// Fetch & render offerings from PFI
const { web5, did } = await Web5.connect();

console.log('Alice: Alice did is', did);

// how does Alice find PFI's DID?
// similar thing to what we had to do with Dinger - we first spin up PFI, get its DID, then hardcode it here so Alice can know about it so Alice can talk to the PFI.


// await configureProtocol(aliceProtocolDefinition);
// await getOfferingFromPFI();

const rfqForm = document.querySelector('#send-rfq-form');

rfqForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await writeRFQ();
});

const quoteForm = document.querySelector('#attempt-send-quote-form');

quoteForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  await attemptToSendQuote();
});

// Testing out negative case
// if Alice writes a Quote in response to her own RFQ
// and attempts to send it to a PFI
// that should be rejected by DWN protocol
async function attemptToSendQuote() {

  const rfq = await getFirstRFQFromAliceDWN();

  const rfqJson = await rfq.data.json();

  const quote: Quote = {
    rfq        : rfqJson,
    amount     : 0.01,
    expiryDate : '2023-06-30T15:30:00Z',
  };

  const { record, status } = await web5.dwn.records.write({
    data    : quote,
    message : {
      contextId    : rfqJson.contextId,
      parentId     : rfqJson.id,
      protocol     : aliceProtocolDefinition.protocol,
      protocolPath : 'RFQ/Quote',
      schema       : 'https://tbd.website/protocols/tbdex/Quote',
      recipient    : pfiDid
    }
  });

  if (status.code !== 202) {
    alert('Failed to write Quote to local. will not send to PFI. Reason: ' + status.code + ' ' + status.detail);
    return;
  }

  // send is a separate step to actually push the record to a third party DWN
  // in this case, the third party DWN is the PFI DWN.
  await record.send(pfiDid);
}


async function getFirstRFQFromAliceDWN() {
  const { records, status } = await web5.dwn.records.query({
    message: {
      filter: {
        protocol : 'https://tbd.website/protocols/tbdex',
        schema   : 'https://tbd.website/protocols/tbdex/RequestForQuote'
      }
    }
  });

  if (status.code !== 200) {
    alert('failed to get my own RFQs' + status.code + ' ' + status.detail);
  }
  alert('Grabbing the first RFQ record from Alices DWN: ' + records[0].contextId);
  return records[0];
}


async function getOfferingFromPFI() {
  const { records, status } = await web5.dwn.records.query({
    from    : pfiDid,
    message : {
      filter: {
        schema: 'tbdex.io/schemas/offering'
      }
    }
  });

  if (status.code !== 200) {
    alert('life is hard');
  }

  for (let record of records) {
    const offering: Offering = await record.data.json();
    console.log('got offering!', offering);
  }
}

async function writeRFQ() {
  const rfq: RFQ = {
    offering_id             : '123',
    product                 : 'BTC_USD',
    size                    : 100,
    presentation_submission : {}
  };
  const { record, status } = await web5.dwn.records.write({
    data    : rfq,
    message : {
      protocol     : aliceProtocolDefinition.protocol,
      protocolPath : 'RFQ',
      schema       : 'https://tbd.website/protocols/tbdex/RequestForQuote',
      recipient    : pfiDid
    }
  });

  if (status.code !== 202) {
    alert('failed to write RFQ to local. will not send to PFI :/ ' + status.code + ' ' + status.detail);
    return;
  }

  // send is a separate step to actually push the record to a third party DWN
  // in this case, the third party DWN is the PFI DWN.
  await record.send(pfiDid);
  alert('sent RFQ to PFI ' + pfiDid.substring(0, 20) + '...');

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

