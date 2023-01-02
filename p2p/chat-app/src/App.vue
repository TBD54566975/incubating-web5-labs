<script setup>
import { onMounted } from 'vue';

const { web5 } = globalThis.web5;

onMounted(async () => {
  const { isAllowed } = await window.web5.dwn.requestAccess();

  if (!isAllowed) {
    toast.error('Access to DWN is forbidden. cannot write TODOs to DWN');
    return;
  }

  const result = await window.web5.dwn.processMessage({
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
                  'recipient': {
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
    toast.error('Failed to fetch todos from DWN. check console for error');
    console.error(result);

    return;
  }



});
</script>

<template>
  <p>Herro</p>
</template>