import { Command } from 'commander';
import { cmd as addContactCmd } from './contact.js';

export const cmd = new Command('add');
cmd.description('add things');

cmd.addCommand(addContactCmd);