import prompts from 'prompts';
import { Command } from 'commander';
import { RemoteDwnClient } from '../../lib/remote-dwn-client.js';
import { Contact } from '../../models/contact.js';
import { DidLoader } from '../../did/did-loader.js';

export const cmd = new Command('contact');

cmd.description('adds a contact to your "didbook"');

cmd.option('-d, --did [did]', 'contact\'s did.');
cmd.option('-h, --handle [handle]', 'a friendly handle. Did\'s are long and ugly');

cmd.action(async () => {
  let { did, handle } = cmd.opts();
  const questions = [];
  
  if (!did) {
    questions.push(interactivePrompts.did);
  }

  if (!handle) {
    questions.push(interactivePrompts.handle);
  }

  if (questions.length > 0) {
    const result = await prompts(questions, { onCancel: () => process.exit(0) });

    did ??= result.did;
    handle ??= result.handle;
  }

  const contact = new Contact(did, handle);
  const dWebMessage = await contact.toDWebMessage(DidLoader.getSignatureMaterial());

  const result = await RemoteDwnClient.send(dWebMessage, DidLoader.getDid());

  if (result.status.code !== 202) {
    throw new Error('failed to add contact');
  }

  console.log(`${handle} added as contact!`);
});

const interactivePrompts = {
  did: {
    type    : 'text',
    name    : 'did',
    message : 'what\'s the contact\'s did?',
  
  },
  handle: {
    type    : 'text',
    name    : 'handle',
    message : 'provide a friendly handle. Did\'s are long and ugly',
  }
};

