<script setup>
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['submitted']);

const name = ref('');
const did = ref('');
const message = ref('');

async function onSubmit() {
  if (name.value.length === 0 || did.value.length === 0 || message.value.length === 0) {
    return;
  }

  emit('submitted', { did: did.value, name: name.value, text: message.value });
}
</script>

<template>
  <div class="font-tbd">
    <form @submit.prevent="onSubmit">
      <!-- Title -->
      <div class="text-lg text-center">
        Send Message
      </div>

      <!-- Name Input -->
      <div class="mt-6">
        <div class="flex justify-between">
          <label for="name" class="block font-medium text-gray-700 text-sm">Recipient Name</label>
        </div>
        <div class="mt-1">
          <input type="text" name="name" id="name" v-model="name"
            class="block border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm sm:text-sm w-full"
            placeholder="Moe">
        </div>
      </div>

      <!-- DID Input -->
      <div class="mt-4">
        <div class="flex justify-between">
          <label for="did" class="block font-medium text-gray-700 text-sm">Recipient DID</label>
        </div>
        <div class="mt-1">
          <input type="text" name="did" id="did" v-model="did"
            class="block border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm sm:text-sm w-full">
        </div>
      </div>

      <div class="mt-4">
        <div class="flex justify-between">
          <label for="message" class="block font-medium text-gray-700 text-sm">Message</label>
        </div>
        <div class="mt-1">
          <input type="text" name="message" id="message" v-model="message"
            class="block border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm sm:text-sm w-full">
        </div>
      </div>

      <!-- Create Thread Button -->
      <button type="submit"
        class="bg-blue-500 border-transparent flex focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-tbd-yellower justify-center mt-4 px-4 py-4 rounded-md shadow-sm text-lg text-white w-full">
        Submit
      </button>
    </form>
  </div>
</template>