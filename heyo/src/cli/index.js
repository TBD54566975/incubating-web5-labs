import { Command } from 'commander';

import { cmd as addCmd } from './add/index.js';
import { cmd as getCmd } from './get/index.js';
import { cmd as resolveCmd } from './resolve/index.js';
import { cmd as sendCmd } from './send/index.js';
import { cmd as showCmd } from './show/index.js';

import { Heyo } from '../lib/heyo.js';
import { DidLoader } from '../did/did-loader.js';

await Heyo.initializeProtocol(DidLoader.getDid(), DidLoader.getSignatureMaterial());

export const cli = new Command('heyo');
cli.description('holla atchya did');
cli.version('0.0.1');

cli.addCommand(addCmd);
cli.addCommand(getCmd);
cli.addCommand(resolveCmd);
cli.addCommand(sendCmd);
cli.addCommand(showCmd);
