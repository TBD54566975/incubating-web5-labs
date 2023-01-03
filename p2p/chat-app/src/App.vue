<script setup>
import { base64url } from 'multiformats/bases/base64';
import { onMounted, ref, toRaw } from 'vue';
import { useIntervalFn } from '@vueuse/core';
import Threads from './components/Threads.vue';
import Chat from './components/Chat.vue';
import SendMessageForm from './components/SendMessageForm.vue';

const { web5 } = globalThis;

const protocolInstalled = ref(false);
const threads = ref([]);
const activeThread = ref(undefined)
const chat = ref([]);

let chatRefreshFn;

onMounted(async () => {
  const { isAllowed } = await web5.dwn.requestAccess();

  if (!isAllowed) {
    toast.error('Access to DWN is forbidden. cannot write TODOs to DWN');
    return;
  }

  // create protocol
  // TODO: query for protocol before trying to create
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
                    'of': 'thread',
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

  console.log(result);

  if (result.status.code !== 202) {
    if (result.status.code === 409) {
      // protocol has already been written. ignore
    } else {
      console.error(result);
      return;
    }

  }

  protocolInstalled.value = true;

  useIntervalFn(async () => {
    const { status, entries } = await web5.dwn.processMessage({
      method: 'CollectionsQuery',
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

async function sendMessage(messageText) {
  const lastMessage = chat.value[chat.value.length - 1];
  console.log(lastMessage.dWebMessage.contextId);

  const result = await web5.dwn.processMessage({
    method: 'CollectionsWrite',
    data: { messageText },
    message: {
      protocol: 'chat',
      schema: 'chat/message',
      dataFormat: 'application/json',
      recipient: activeThread.value.data.authorDid,
      parentId: lastMessage.dWebMessage.recordId,
      contextId: lastMessage.dWebMessage.contextId,
    }
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
      method: 'CollectionsQuery',
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
    <div class="flex">
      <Threads @select-thread="selectThread" :threads="threads" />
      <Chat :messages="chat" :active-thread="activeThread" />
    </div>
    <SendMessageForm @send-message="sendMessage" />
  </div>
  <div v-else>
  </div>
</template>