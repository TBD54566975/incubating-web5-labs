import prompts from 'prompts';
import { Command } from 'commander';
import { Heyo } from '../../lib/heyo.js';
import { Thread } from '../../models/thread.js';
import { DM } from '../../models/DM.js';
import { DidLoader } from '../../did/did-loader.js';
import { RemoteDwnClient } from '../../lib/remote-dwn-client.js';

export const cmd = new Command('dm');

cmd.option('-t, --to [did]', 'the did you want to holler at.', );
cmd.option('--c, --content [message]', 'what you want to say.');

cmd.action(async () => {
  let { content, to } = cmd.opts();
  const questions = [];
  
  if (!to) {
    questions.push(interactivePrompts.to);
  }

  if (!content) {
    questions.push(interactivePrompts.content);
  }

  if (questions.length > 0) {
    const result = await prompts(questions, { onCancel: () => process.exit(0) });

    content ??= result.content;
    to ??= result.to;
  }

  // TODO: check if thread with recipient already exists
  let thread;
  let threads = await Heyo.findThreads(DidLoader.getDid(), { recipient: to }, DidLoader.getSignatureMaterial());
  
  if (threads.length > 0) {
    thread = threads[0];
  }

  threads = await Heyo.findThreads(DidLoader.getDid(), { attester: to }, DidLoader.getSignatureMaterial());

  if (threads.length > 0) {
    thread = threads[0];
  }

  if (!thread) {
    thread = new Thread(to);

    const dWebMessage = await thread.toDWebMessage(DidLoader.getSignatureMaterial());
    
    let result = await RemoteDwnClient.send(dWebMessage, DidLoader.getDid());

    if (result.status.code !== 202) {
      throw new Error(`failed to create thread. error: ${JSON.stringify(result)}`);
    }
    
    result = await RemoteDwnClient.send(dWebMessage, to);

    if (result.status.code !== 202) {
      throw new Error(`failed to create thread. error: ${JSON.stringify(result)}`);
    }
  }

  const dm = new DM(content, thread.contextId);
  const dWebMessage = await dm.toDWebMessage(DidLoader.getSignatureMaterial());

  let result = await RemoteDwnClient.send(dWebMessage, DidLoader.getDid());

  if (result.status.code !== 202) {
    throw new Error(`failed to send DM. error: ${JSON.stringify(result)}`);
  }

  result = await RemoteDwnClient.send(dWebMessage, to);

  if (result.status.code !== 202) {
    throw new Error(`failed to send DM. error: ${JSON.stringify(result)}`);
  }
});

const interactivePrompts = {
  to: {
    type    : 'text',
    name    : 'to',
    message : 'who do you want to send the message to?',
  
  },
  content: {
    type    : 'text',
    name    : 'content',
    message : 'what do you want to say?',
  }
};