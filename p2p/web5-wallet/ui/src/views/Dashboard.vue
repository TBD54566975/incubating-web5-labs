<script setup>
import { ref } from 'vue';

const identityName = ref('');
const dwnProviderHostname = ref('');

async function weehee() {
  console.log('hello?');
  await chrome.runtime.sendMessage({
    id   : Date.now(),
    cmd  : 'CREATE_ION_DID',
    data : {
      dwnProviderHostname,
      identityName,
    },
  });
}
</script>

<template>
  <header class="align-middle bg-tbd-yellow border-b border-gray-200 flex h-20 justify-center">
    <p class="max-h-fit my-5 text-2xl">
      Web5 Wallet
    </p>
  </header>
  <main class="flex flex-col mt-8">
    <div class="mt-8 sm:max-w-md sm:mx-auto sm:w-full">
      <form class="bg-white px-6 py-8 rounded-lg shadow sm:px-10" @submit.prevent="weehee">
        <!-- Title -->
        <div class="text-lg">
          Create ION DID
        </div>
        
        <!-- Name Input -->
        <div class="mt-6">
          <div class="flex justify-between">
            <label for="name" class="block font-medium text-gray-700 text-sm">Name</label>
          </div>
          <div class="mt-1">
            <input
              type="text" name="name" id="name"
              v-model="identityName"
              class="block border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm sm:text-sm w-full"
              placeholder="Social">
          </div>
        </div>

        <!-- Service Endpoint Input -->
        <div class="mt-4">
          <div class="flex justify-between">
            <label for="service-endpoint" class="block font-medium text-gray-700 text-sm">DWN Provider Hostname</label>
            <span class="text-gray-500 text-sm" id="email-optional">Optional</span>
          </div>
          <div class="mt-1">
            <input
              type="text" name="service-endpoint" id="service-endpoint" 
              v-model="dwnProviderHostname"
              class="block border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm sm:text-sm w-full">
          </div>
        </div>
        
        <!-- Create DID Button -->
        <button
          type="submit"
          class="bg-blue-500 border-transparent flex focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-tbd-yellower justify-center mt-4 px-4 py-4 rounded-md shadow-sm text-lg text-white w-full">
          Submit
        </button>
      </form>
    </div>
  </main>
</template>