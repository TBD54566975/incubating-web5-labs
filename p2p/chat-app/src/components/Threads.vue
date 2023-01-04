<script setup>
import { onUpdated, ref } from 'vue';
import { PencilSquareIcon } from '@heroicons/vue/24/outline';

import CreateThreadForm from './CreateThreadForm.vue';
import Modal from './Modal.vue';

const props = defineProps(['threads']);
const emit = defineEmits(['select-thread', 'create-thread']);

const selectedThreadId = ref(undefined);
const showCreateThreadModal = ref(false);

function selectThread(threadId) {
  selectedThreadId.value = threadId;
  emit('select-thread', threadId);
}

function createThread(newThreadInfo) {
  showCreateThreadModal.value = false;
  emit('create-thread', newThreadInfo);
}

onUpdated(() => {
  if (!selectedThreadId.value && props.threads.length > 0) {
    selectThread(props.threads[0].dWebMessage.recordId);
  }
});

</script>

<template>
  <div class="border-r border-black fixed flex flex-col flex-grow h-screen w-64">
    <!-- Logo -->
    <div class="flex space-x-4 p-4 w-full border-b border-black justify-between">
      <p class="text-xl">
        5ignal
      </p>
      <button>
        <PencilSquareIcon @click="showCreateThreadModal = true" class="h-7 w-7" />
      </button>
    </div>
    <div class="flex flex-col flex-grow">
      <div @click="selectThread(thread.dWebMessage.recordId)"
        :class="[selectedThreadId === thread.dWebMessage.recordId ? 'bg-slate-300' : '']"
        class="flex-col border-b py-4 border-black cursor-pointer flex align-middle w-full justify-center"
        v-for="thread in props.threads" :key="thread.dWebMessage.recordId">
        <p class="m-auto">{{ thread.data.subject }}</p>
      </div>
    </div>
  </div>
  <Modal :open="showCreateThreadModal" @close="showCreateThreadModal = false">
    <template #default>
      <CreateThreadForm @submitted="createThread" />
    </template>
  </Modal>
</template>