import type { Offering, RFQ } from './common.js';
import { aliceProtocolDefinition, pfiDid } from './protocol.js'
import { Web5 } from '@tbd54566975/web5';

// Fetch & render offerings from PFI
const { web5, did } = await Web5.connect();

console.log('Alice: Alice did is', did)

// how does Alice find PFI's DID? 
// similar thing to what we had to do with Dinger - we first spin up PFI, get its DID, then hardcode it here so Alice can know about it so Alice can talk to the PFI.


await configureProtocol(aliceProtocolDefinition)
await getOfferingFromPFI()

const rfqForm = document.querySelector('#send-rfq-form');

rfqForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await writeRFQ();
});


async function getOfferingFromPFI() {
    const { records, status } = await web5.dwn.records.query({
        from: pfiDid,
        message: {
            filter: {
                schema: 'tbdex.io/schemas/offering'
            }
        }
    })

    if (status.code !== 200) {
        alert('life is hard');
    }

    for (let record of records) {
        const offering: Offering = await record.data.json();
        console.log('got offering!', offering)
    }
}

async function writeRFQ() {
    const rfq: RFQ = {
        offering_id: '123',
        product: 'BTC_USD',
        size: 100,
        presentation_submission: {}
    }
    const { record, status } = await web5.dwn.records.write({
        data: rfq,
        message: {
            protocol: aliceProtocolDefinition.protocol,
            protocolPath: 'RFQ',
            schema: 'https://tbd.website/protocols/tbdex/RequestForQuote',
            recipient: pfiDid
        }
    })
    
    if (status.code !== 202) {
        alert('failed to write RFQ to local. will not send to PFI :/ ' + status.code)
        console.log(status)
        return
    }

    // send is a separate step to actually push the record to a third party DWN
    // in this case, the third party DWN is the PFI DWN.
    await record.send(pfiDid)

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
  
  