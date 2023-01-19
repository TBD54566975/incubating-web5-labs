<script setup>
import { base64url } from 'multiformats/bases/base64';
import { onMounted, ref, toRaw } from 'vue';
import { useIntervalFn } from '@vueuse/core';

import Threads from './components/Threads.vue';
import Chat from './components/Chat.vue';
import SendMessageForm from './components/SendMessageForm.vue';

const { web5 } = globalThis;

const protocolInstalled = ref(true);
const threads = ref([]);
const activeThread = ref(undefined)
const chat = ref([]);
const userDid = ref('');
const username = ref('');

let chatRefreshFn;

onMounted(async () => {
  const { isAllowed, did, name } = await web5.dwn.requestAccess();

  if (!isAllowed) {
    toast.error('Access to DWN is forbidden. cannot write TODOs to DWN');
    return;
  }

  userDid.value = did;
  username.value = name;

  const { status, entries } = await web5.dwn.processMessage({
    method: 'ProtocolsQuery',
    message: {
      filter: { protocol: 'chat' }
    }
  });

  if (status.code !== 200) {
    console.error('failed to query protocols', status);
    return;
  }

  if (entries.length === 0) {
    const result = await web5.dwn.processMessage({
      method: 'ProtocolsConfigure',
      message: {
        protocol: 'chat',
        definition: {
          'labels': {
            'thread': {
              'schema': 'chat/thread'
            },
            'message': {
              'schema': 'chat/message'
            }
          },
          'records': {
            'thread': {
              'allow': {
                'anyone': {
                  'to': [
                    'write'
                  ]
                }
              },
              'records': {
                'message': {
                  'allow': {
                    'anyone': {
                      'to': [
                        'write'
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (result.status.code !== 202) {
      if (result.status.code === 409) {
        // protocol has already been written. ignore
      } else {
        console.error('failed to create protocol. result:', result);
        return;
      }
    }
  }

  protocolInstalled.value = true;

  useIntervalFn(async () => {
    const { status, entries } = await web5.dwn.processMessage({
      method: 'RecordsQuery',
      message: {
        filter: {
          protocol: 'chat',
          schema: 'chat/thread'
        },
        dateSort: 'createdAscending'
      }
    });

    if (status.code !== 200) {
      console.error('failed to fetch threads from dwn. result', result)
      return;
    }

    const textDecoder = new TextDecoder();
    const parsedThreads = [];

    if (entries.length === threads.value.length) {
      return;
    }

    for (let entry of entries) {
      const threadBytes = base64url.baseDecode(entry.encodedData);
      const threadStringified = textDecoder.decode(threadBytes);
      const threadData = JSON.parse(threadStringified);

      parsedThreads.push({
        dWebMessage: entry,
        data: threadData
      });
    }

    threads.value = parsedThreads;
  }, 1000, { immediateCallback: true });


  // await web5.dwn.subscribe(filter);
});

async function createThread(newThreadInfo) {
  const { name, did, text } = newThreadInfo;

  const { record: thread, result: createThreadResult } = await web5.dwn.processMessage({
    method: 'RecordsWrite',
    message: {
      protocol: 'chat',
      schema: 'chat/thread',
      dataFormat: 'application/json',
      recipient: did,
    },
    data: {
      from: { did: userDid.value, name: username.value },
      to: { did, name },
      subject: name
    }
  });

  if (createThreadResult.status.code !== 202) {
    console.error('failed to create thread', result, record);
    return;
  }

  console.log('create chat/thread result:', { record: thread, result: createThreadResult });

  // TODO: create message
  const result = await web5.dwn.processMessage({
    method: 'RecordsWrite',
    message: {
      protocol: 'chat',
      schema: 'chat/message',
      dataFormat: 'application/json',
      recipient: did,
      parentId: thread.recordId,
      contextId: thread.contextId,
    },
    data: {
      from: { did: userDid.value, name: username.value },
      to: { did, name },
      text,
    },
  });

  console.log('create chat/message result:', result);
}

async function sendMessage(messageText) {
  const firstMessage = toRaw(chat.value[0]);
  console.log(firstMessage);
  // probably slow bc did is so long. use a set instead
  const recipient = firstMessage.data.to.did === userDid.value ? firstMessage.data.from : firstMessage.data.to;

  const result = await web5.dwn.processMessage({
    method: 'RecordsWrite',
    message: {
      protocol: 'chat',
      schema: 'chat/message',
      dataFormat: 'application/json',
      recipient: recipient.did,
      parentId: activeThread.value.dWebMessage.recordId,
      contextId: activeThread.value.dWebMessage.contextId,
    },
    data: {
      to: {
        did: recipient.did,
        name: recipient.name
      },
      from: {
        did: userDid.value,
        name: username.value,
      },
      text: messageText
    },
  });

  console.log(result);
}

function selectThread(threadId) {
  if (chatRefreshFn) {
    chatRefreshFn.pause();
  }

  let selectedThread = threads.value.find(thread => {
    return thread.dWebMessage.recordId === threadId;
  });

  selectedThread = toRaw(selectedThread);
  activeThread.value = selectedThread;

  chatRefreshFn = useIntervalFn(async () => {
    const { status, entries } = await web5.dwn.processMessage({
      method: 'RecordsQuery',
      message: {
        filter: {
          protocol: 'chat',
          schema: 'chat/message',
          contextId: selectedThread.dWebMessage.contextId
        },
        dateSort: 'createdAscending'
      }
    });

    if (status.code !== 200) {
      console.error('failed to fetch messages from dwn. result', result)
      return;
    }

    const textDecoder = new TextDecoder();
    const parsedMessages = [];

    for (let entry of entries) {
      const messageBytes = base64url.baseDecode(entry.encodedData);
      const messageStringified = textDecoder.decode(messageBytes);
      const messageData = JSON.parse(messageStringified);

      parsedMessages.push({
        dWebMessage: entry,
        data: messageData
      });
    }

    chat.value = parsedMessages;

  }, 1000, { immediateCallback: true });
}
</script>

<template>
  <div class="flex-col h-screen" v-if="protocolInstalled">
    <div class="flex h-0">
      <Threads @select-thread="selectThread" @create-thread="createThread" :threads="threads" />
      <Chat :messages="chat" :userDid="userDid" />
    </div>
    <SendMessageForm @send-message="sendMessage" />
  </div>
  <div v-else>
  </div>
</template>