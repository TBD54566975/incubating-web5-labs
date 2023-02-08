import { Command } from 'commander';
import { Heyo } from '../../lib/heyo.js';

export const cmd = new Command('protocol');

cmd.description('prints out the heyo protocol');
cmd.action(() => console.log(Heyo.prettyPrintProtocol()));