<script setup>
// TODO: include ability to select did type: key, ion, etc.

import { ref, defineEmits } from 'vue';
import { BackgroundRequest } from '../background-request';

const emit = defineEmits(['submitted']);

const profileName = ref('');
const dwnProviderHostname = ref('');

async function createProfile() {
  const payload = {
    didMethod : 'ion',
    name      : profileName.value
  };

  if (dwnProviderHostname.value) {
    payload.options = {
      serviceEndpoint: dwnProviderHostname.value
    };
  }

  const resp = await BackgroundRequest.post('/profiles', payload);

  // TODO: handle non-201 status codes
  if (resp.status === 201) {
    emit('submitted');
  }
}
</script>

<template>
  <div class="font-tbd">
    <form @submit.prevent="createProfile">
      <!-- Title -->
      <div class="text-lg">
        Create Profile
      </div>
        
      <!-- Name Input -->
      <div class="mt-6">
        <div class="flex justify-between">
          <label for="name" class="block font-medium text-gray-700 text-sm">Name</label>
        </div>
        <div class="mt-1">
          <input
            type="text" name="name" id="name"
            v-model="profileName"
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
</template>