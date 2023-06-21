import { Web5 } from '@tbd54566975/web5';
import { protocolDefinition } from '../tbdex-protocol.js'

const { web5 } = await Web5.connect();

const result = await web5.dwn.protocols.configure({
  message: {
    definition: protocolDefinition
  }
});
console.log('Result:', result);
