import { Command } from 'commander';
import { cmd as dmCmd } from './dm.js';

export const cmd = new Command('send');
cmd.addCommand(dmCmd);