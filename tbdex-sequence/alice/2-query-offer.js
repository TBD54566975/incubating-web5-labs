import { Web5 } from '@tbd54566975/web5';
import {DID} from '../pfi/identity.js'

const proxyDid = DID;

const { web5 } = await Web5.connect();

const result = await web5.dwn.records.query({
  from: proxyDid,
  message: {
    filter: {
      recordId: 'bafyreieb6fbpp36z3owgkfgdxt2wuebiyr6xp4zquwowg3dcanabucfgby'
    }
  }
})
console.log('Result', await result.records[0].data.json())
