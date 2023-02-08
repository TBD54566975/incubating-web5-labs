import { Command } from 'commander';
import { cmd as resolveDidCmd } from './did.js';

export const cmd = new Command('resolve');
cmd.addCommand(resolveDidCmd);