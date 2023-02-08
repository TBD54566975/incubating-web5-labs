import { Command } from 'commander';
import { cmd as watchConvoCmd } from './convo.js';

export const cmd = new Command('watch');
cmd.addCommand(watchConvoCmd);