import { Command } from 'commander';
import { DidLoader } from '../../did/did-loader.js';

export const cmd = new Command('did');

cmd.description('prints your did');
cmd.action(() => console.log(DidLoader.getDid()));