<script setup>
import { ref, onMounted } from 'vue';
import { ClipboardDocumentIcon } from '@heroicons/vue/24/outline';
import { BackgroundRequest } from '../background-request';
import Modal from '../components/Modal.vue';
import CreateIonDidForm from '../components/CreateIonDidForm.vue';

const showCreateIdentityModal = ref(false);
const identities = ref([]);

onMounted(async () => {
  const { data } = await BackgroundRequest.get('/identities');
  identities.value = data;
});

async function copyDidToClipboard(identity) {
  await navigator.clipboard.writeText(identity.did);
}

</script>

<template>
  <div class="lg:px-8 mt-16 px-4 sm:px-6">
    <!-- Title -->
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="font-semibold text-gray-900 text-xl">
          Identities
        </h1>
        <p class="mt-2 text-gray-700 text-sm">
          A list of all your identities including their name, did, and creation date.
        </p>
      </div>
      <div class="mt-4 sm:flex-none sm:ml-16 sm:mt-0">
        <button
          type="button" @click="showCreateIdentityModal = true"
          class="bg-indigo-600 border border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium hover:bg-indigo-700 inline-flex items-center justify-center px-4 py-2 rounded-md shadow-sm sm:w-auto text-sm text-white">
          Create Identity
        </button>
      </div>
    </div>
    <!-- Table Container  -->
    <div class="flex flex-col mt-8">
      <div class="-mx-4 -my-2 lg:-mx-8 overflow-x-auto sm:-mx-6">
        <div class="align-middle inline-block lg:px-8 md:px-6 min-w-full py-2">
          <!-- Table -->
          <table class="divide-gray-300 divide-y min-w-full">
            <!-- Table Header -->
            <thead>
              <tr>
                <th scope="col" class="font-semibold md:pl-0 pl-4 pr-3 py-3.5 sm:pl-6 text-gray-900 text-left text-sm">
                  Name
                </th>
                <th scope="col" class="font-semibold px-3 py-3.5 text-gray-900 text-left text-sm">
                  DID
                </th>
                <th scope="col" class="font-semibold px-3 py-3.5 text-gray-900 text-left text-sm">
                  DID Doc 
                </th>
                <th scope="col" class="font-semibold px-3 py-3.5 text-gray-900 text-left text-sm">
                  Date Created
                </th>
              </tr>
            </thead>
            <!-- Table Body -->
            <tbody class="divide-gray-200 divide-y">
              <tr v-for="identity in identities" :key="identity._id">
                <td class="font-medium md:pl-0 pl-4 pr-3 py-4 sm:pl-6 text-gray-900 text-sm whitespace-nowrap">
                  {{ identity.name }}
                </td>
                <td class="flex px-3 py-4 space-x-2 text-gray-500 text-sm whitespace-nowrap">
                  {{ identity.didMethod }}
                  <ClipboardDocumentIcon class="cursor-pointer h-6 text-black w-6" @click="copyDidToClipboard(identity)" />
                </td>
                <td class="px-3 py-4 text-gray-500 text-sm whitespace-nowrap">
                  <a href="#" class="hover:text-indigo-900 text-indigo-600">Resolve</a>
                </td>
                <td class="px-3 py-4 text-gray-500 text-sm whitespace-nowrap">
                  {{ identity.dateCreated }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <Modal :open="showCreateIdentityModal" @close="showCreateIdentityModal = false">
    <template #default>
      <CreateIonDidForm @submitted="showCreateIdentityModal = false" />
    </template>
  </Modal>
</template>