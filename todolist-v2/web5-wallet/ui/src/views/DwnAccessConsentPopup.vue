<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const requestingDomain = ref('');

const route = useRoute();
const { task } = route.query;

onMounted(async () => {
  const results = await chrome.storage.session.get(task);
  const result = results[task];

  requestingDomain.value = result.requestingDomain;
});

async function grantAccess(isAllowed) {
  await chrome.storage.session.set({ [task]: isAllowed });
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
    <main class="mt-8 flex flex-col">
      <p class="mx-auto">
        <span class="font-bold">{{ requestingDomain }}</span>
        is requesting access to your DWN
      </p>
      <div class="flex space-x-4 mx-4 mt-16">
        <button type="button" @click.prevent="grantAccess(true)"
          class="bg-green-600 border-transparent flex focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-tbd-yellower justify-center px-4 py-4 rounded-md shadow-sm text-black text-md w-full">
          Grant
        </button>
        <button type="button" @click.prevent="grantAccess(false)"
          class="bg-red-600 border-transparent flex focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-tbd-yellower justify-center px-4 py-4 rounded-md shadow-sm text-black text-md w-full">
          Decline
        </button>
      </div>
    </main>
  </div>
</template>