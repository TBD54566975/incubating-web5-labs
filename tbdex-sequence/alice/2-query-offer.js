import { Web5 } from '@tbd54566975/web5';
import {DID} from '../pfi/identity.js'

const proxyDid = DID;

const { web5 } = await Web5.connect();

const result = await web5.dwn.records.query({
  from: proxyDid,
  message: {
    filter: {
      recordId: 'bafyreiahb4xryqoviqasf3dsfrzh5arg4n5gh352tpx7mosjren7pc3roy'
    }
  }
})
console.log('Result', await result.records[0].data.json())
