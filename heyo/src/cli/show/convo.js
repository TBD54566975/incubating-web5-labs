import prompts from 'prompts';
import { Command } from 'commander';
import { RemoteDwnClient } from '../../lib/remote-dwn-client.js';
import { DidLoader } from '../../did/did-loader.js';
import { RecordsQuery } from '@tbd54566975/dwn-sdk-js';
import { Thread } from '../../models/Thread.js';
import { Heyo } from '../../lib/heyo.js';

export const cmd = new Command('convo');

cmd.description('shows a conversation');
cmd.option('-d, --did [did]');

cmd.action(async () => {
  let { did } = cmd.opts();
  const selfDid = new Set([DidLoader.getDid()]);
  let threadId;

  if (!did) {
    const threads = await Heyo.listThreads(DidLoader.getDid(), DidLoader.getSignatureMaterial());

    const question = {
      type    : 'select',
      name    : 'threadId',
      choices : [],
      message : 'Convo with whom?',
    };
    
    for (let thread of threads) {
      const otherDid = selfDid.has(thread.recipient) ? thread.author : thread.recipient;

      const choice = { title: otherDid, value: thread.contextId };
      question.choices.push(choice);
    }

    const result = await prompts([question], { onCancel: () => process.exit(0) });
    threadId = result.threadId;
  } else {
    const thread = await Heyo.findThreadWithDid(DidLoader.getDid(), did, DidLoader.getSignatureMaterial());

    if (!thread) {
      console.log(`no convo exists with ${did}`);
      return;
    }

    threadId = thread.contextId;
  }

  const dms = await Heyo.getThreadDMs(DidLoader.getDid(), threadId, DidLoader.getSignatureMaterial());
  const display = [];
  
  for (let dm of dms) {
    display.push({
      from    : selfDid.has(dm.author) ? 'me' : dm.author,
      message : dm.content,
      date    : dm.dateCreated,
    });
  }

  console.table(display, ['from', 'message', 'date']);
});