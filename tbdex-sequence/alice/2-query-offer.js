import { Web5 } from '@tbd54566975/web5';
import {DID} from '../pfi/identity.js'

const proxyDid = DID;

const { web5 } = await Web5.connect();

const result = await web5.dwn.records.query({
  from: proxyDid,
  message: {
    filter: {
      recordId: 'bafyreict4vcvwdwt32n5qsspzfsrfxssm26iqawlwj3olsdbyvdpragbv4'
    }
  }
})
console.log('Result', await result.records[0].data.json())
