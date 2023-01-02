<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { BackgroundRequest } from '../background-request';

const requestingDomain = ref('soso');
const identities = ref([]);
const selectedIdentity = ref(undefined);

const route = useRoute();
const { task } = route.query;

onMounted(async () => {
  const results = await chrome.storage.session.get(task);
  const result = results[task];

  requestingDomain.value = result.requestingDomain;

  const { data } =  await BackgroundRequest.get('/identities');
  identities.value = data;
});

async function grantAccess(isAllowed) {
  await chrome.storage.session.set({ [task]: { isAllowed, did: selectedIdentity.value.did } });
  window.close();
}

</script>

<template>
  <div class="font-tbd">
    <header class="align-middle bg-tbd-yellow border-b border-gray-200 flex h-20 justify-center">
      <p class="max-h-fit my-5 text-2xl">
        Web5 Wallet
      </p>
    </header>
    <main class="flex flex-col mt-8">
      <p class="mx-auto">
        <span class="font-bold">{{ requestingDomain }}</span>
        is requesting access to your DWN
      </p>
      <div class="mt-4 mx-4">
        <label for="identity" class="block font-medium text-gray-700 text-sm">Identity</label>
        <select
          id="identity" name="identity" v-model="selectedIdentity"
          class="block border-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 mt-1 pl-3 pr-10 py-2 rounded-md sm:text-sm text-base w-full">
          <option disabled value="">
            Select an identity
          </option>
          <option v-for="identity in identities" :key="identity._id">
            {{ identity.name }}
          </option>
        </select>
      </div>
      <div class="flex mt-16 mx-4 space-x-4">
        <button
          type="button" @click.prevent="grantAccess(true)"
          class="bg-green-600 border-transparent flex focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-tbd-yellower justify-center px-4 py-4 rounded-md shadow-sm text-black text-md w-full">
          Grant
        </button>
        <button
          type="button" @click.prevent="grantAccess(false)"
          class="bg-red-600 border-transparent flex focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-tbd-yellower justify-center px-4 py-4 rounded-md shadow-sm text-black text-md w-full">
          Decline
        </button>
      </div>
    </main>
  </div>
</template>