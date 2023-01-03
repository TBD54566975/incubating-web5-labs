<script setup>
import { ref } from 'vue';
import { PlusIcon } from '@heroicons/vue/24/outline';

const emit = defineEmits(['send-message']);

const newMessage = ref('');

function sendMessage() {
  if (newMessage.value === 0) {
    return;
  }

  emit('send-message', newMessage.value);
}
</script>

<template>
  <div class="sticky top-[100vh] h-24 border-t-2 border-gray-200 flex ml-64">
    <form class="flex space-x-4 m-5 align-middle items-center" @submit.prevent="sendMessage">
      <div class="mt-1">
        <input type="text" name="name" id="name" v-model="newMessage"
          class="block w-96 rounded-full border-gray-300 px-4 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Hi2u" />
      </div>
      <div>
        <button type="submit"
          class="inline-flex items-center rounded-full border border-transparent bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <PlusIcon class="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </form>
  </div>
</template>