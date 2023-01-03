<script setup>
import { onMounted, onUpdated, ref } from 'vue';

const props = defineProps(['threads']);
const emit = defineEmits(['select-thread']);

const selectedThreadId = ref(undefined);

function selectThread(threadId) {
  selectedThreadId.value = threadId;
  emit('select-thread', threadId);
}

onUpdated(() => {
  if (!selectedThreadId.value) {
    selectThread(props.threads[0].dWebMessage.recordId);
  }
});

</script>

<template>
  <div class="border-r border-black fixed flex flex-col flex-grow h-screen overflow-y-auto w-64">
    <!-- Logo -->
    <div class="p-4 w-full">
      <p class="text-xl">
        5ignal
      </p>
    </div>
    <div class="flex flex-col flex-grow mt-5">
      <div @click="selectThread(thread.dWebMessage.recordId)"
        :class="[selectedThreadId === thread.dWebMessage.recordId ? 'bg-slate-300': '']"
        class="border-t border-b py-4 border-black cursor-pointer flex align-middle w-full justify-center"
        v-for="thread in props.threads" :key="thread.dWebMessage.recordId">
        <p>{{ thread.data.subject }}</p>
      </div>
    </div>
  </div>
</template>