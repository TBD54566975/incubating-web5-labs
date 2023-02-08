import { Argument, Command } from 'commander';
import { DIDIon } from '../../did/did-ion.js';

export const cmd = new Command('did');

const arg = new Argument('did', 'the did you want to resolve');
arg.required = true;

cmd.description('resolves the did provided');
cmd.addArgument(arg);
cmd.action(async (args) => {
  const resolutionResult = await DIDIon.resolve(args);
  console.log(JSON.stringify(resolutionResult, null, 4));
});