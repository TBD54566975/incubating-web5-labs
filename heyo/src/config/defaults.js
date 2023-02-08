import path from 'path';

import { fileURLToPath } from 'url';

// __filename and __dirname are not defined in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// path to root of this project (aka where package.json is)
const projectRoot = path.resolve(__dirname, '../../');

// path to default directory that contains all config files
export const etcPath = `${projectRoot}/etc`;

export const defaults = {
  config: {
    // path that user-config is loaded from
    path: `${etcPath}/config.js` || process.env.HEYO_PATH
  },
  did: {
    // path to file where associated keys are stored
    storagePath : `${etcPath}/did.json`,
    // type of DID to create if one doesn't already exist
    method      : 'ion'
  },
};