import type { Offering } from './common.js';

import { Web5 } from '@tbd54566975/web5';

console.log('HELLO FROM PFI!', Web5);

const { web5, did } = await Web5.connect();

// TODO: figure out what an offering contains
// TODO: find a no-creds public api to get USD/BTC fx rate

async function loadOfferings() {

}