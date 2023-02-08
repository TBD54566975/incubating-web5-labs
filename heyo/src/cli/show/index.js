import { Command } from 'commander';
import { cmd as showContactsCmd } from './contacts.js';
import { cmd as showConvoCmd } from './convo.js';

export const cmd = new Command('show');

cmd.description('shows you things');

cmd.addCommand(showContactsCmd);
cmd.addCommand(showConvoCmd);
