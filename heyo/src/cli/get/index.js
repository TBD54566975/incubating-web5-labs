import { Command } from 'commander';
import { cmd as getDidCmd } from './did.js';
import { cmd as getProtocolCmd } from './protocol.js';

export const cmd = new Command('get');
cmd.addCommand(getDidCmd);
cmd.addCommand(getProtocolCmd);